 // Data storage - dalam aplikasi nyata, ini akan disimpan di database
        let habits = JSON.parse(localStorage.getItem('habits')) || [];
        let habitHistory = JSON.parse(localStorage.getItem('habitHistory')) || {};

        // Inisialisasi aplikasi
        document.addEventListener('DOMContentLoaded', function() {
            renderHabits();
            updateStats();
            setupReminders();
            renderChart();
        });

        // Fungsi untuk menambah kebiasaan baru
        function addHabit() {
            const input = document.getElementById('habitInput');
            const habitName = input.value.trim();
            
            if (!habitName) {
                showNotification('Mohon masukkan nama kebiasaan!', 'error');
                return;
            }

            const newHabit = {
                id: Date.now(), // ID unik berdasarkan timestamp
                name: habitName,
                streak: 0,
                lastCompleted: null,
                totalCompleted: 0,
                createdAt: new Date().toISOString()
            };

            habits.push(newHabit);
            saveData();
            input.value = '';
            
            renderHabits();
            updateStats();
            showNotification('Kebiasaan baru berhasil ditambahkan! 🎉');
        }

        // Fungsi untuk menandai kebiasaan sebagai selesai
        function completeHabit(habitId) {
            const habit = habits.find(h => h.id === habitId);
            const today = new Date().toDateString();
            
            if (habit && habit.lastCompleted !== today) {
                habit.lastCompleted = today;
                habit.totalCompleted++;
                
                // Hitung streak
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (habit.lastCompleted === yesterday.toDateString() || habit.streak === 0) {
                    habit.streak++;
                } else {
                    habit.streak = 1;
                }

                // Simpan ke history
                if (!habitHistory[habitId]) {
                    habitHistory[habitId] = [];
                }
                habitHistory[habitId].push(today);

                saveData();
                renderHabits();
                updateStats();
                showNotification(`Hebat! Streak ${habit.name}: ${habit.streak} hari! 🔥`);
            } else if (habit.lastCompleted === today) {
                showNotification('Kebiasaan ini sudah diselesaikan hari ini! ✅');
            }
        }

        // Fungsi untuk menghapus kebiasaan
        function deleteHabit(habitId) {
            if (confirm('Apakah Anda yakin ingin menghapus kebiasaan ini?')) {
                habits = habits.filter(h => h.id !== habitId);
                delete habitHistory[habitId];
                saveData();
                renderHabits();
                updateStats();
                showNotification('Kebiasaan berhasil dihapus.');
            }
        }

        // Fungsi untuk merender daftar kebiasaan
        function renderHabits() {
            const grid = document.getElementById('habitsGrid');
            const emptyState = document.getElementById('emptyState');

            if (habits.length === 0) {
                grid.style.display = 'none';
                emptyState.style.display = 'block';
                return;
            }

            grid.style.display = 'grid';
            emptyState.style.display = 'none';

            grid.innerHTML = habits.map(habit => {
                const today = new Date().toDateString();
                const isCompletedToday = habit.lastCompleted === today;
                const progress = Math.min((habit.totalCompleted / 30) * 100, 100); // Progress berdasarkan 30 hari

                return `
                    <div class="habit-card">
                        <div class="habit-header">
                            <div class="habit-name">${habit.name}</div>
                            <div class="streak-count">${habit.streak} hari</div>
                        </div>
                        
                        <div class="habit-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <div class="progress-text">
                                ${habit.totalCompleted} kali diselesaikan
                            </div>
                        </div>

                        <div class="habit-actions">
                            <button class="btn ${isCompletedToday ? 'btn-success' : 'btn-primary'}" 
                                    onclick="completeHabit(${habit.id})"
                                    ${isCompletedToday ? 'disabled' : ''}>
                                ${isCompletedToday ? '✅ Selesai Hari Ini' : '🎯 Tandai Selesai'}
                            </button>
                            <button class="btn btn-danger" onclick="deleteHabit(${habit.id})">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Fungsi untuk update statistik
        function updateStats() {
            const today = new Date().toDateString();
            const completedToday = habits.filter(h => h.lastCompleted === today).length;
            const longestStreak = Math.max(...habits.map(h => h.streak), 0);
            const totalCompleted = habits.reduce((sum, h) => sum + h.totalCompleted, 0);
            const totalPossible = habits.length * 7; // Asumsi 7 hari terakhir
            const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

            document.getElementById('totalHabits').textContent = habits.length;
            document.getElementById('completedToday').textContent = completedToday;
            document.getElementById('longestStreak').textContent = longestStreak;
            document.getElementById('completionRate').textContent = completionRate + '%';
        }

        // Fungsi untuk menampilkan notifikasi
        function showNotification(message, type = 'success') {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.add('show');

            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Fungsi untuk menyimpan data
        function saveData() {
            localStorage.setItem('habits', JSON.stringify(habits));
            localStorage.setItem('habitHistory', JSON.stringify(habitHistory));
        }

        // Fungsi reminder (simulasi - dalam aplikasi nyata menggunakan service worker)
        function setupReminders() {
            if ('Notification' in window) {
                if (Notification.permission === 'default') {
                    Notification.requestPermission();
                }
            }

            // Reminder harian pada jam 8 pagi (simulasi)
            const now = new Date();
            const reminderTime = new Date();
            reminderTime.setHours(8, 0, 0, 0);

            if (now > reminderTime) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }

            const timeUntilReminder = reminderTime.getTime() - now.getTime();
            
            setTimeout(() => {
                if (Notification.permission === 'granted') {
                    new Notification('Habit Tracker Reminder', {
                        body: 'Jangan lupa untuk menyelesaikan kebiasaan harian Anda!',
                        icon: '🎯'
                    });
                }
            }, timeUntilReminder);
        }

        // Fungsi untuk menampilkan laporan
        function showReport(period) {
            document.querySelectorAll('.period-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            renderChart(period);
        }

        // Fungsi untuk merender chart (implementasi sederhana)
        function renderChart(period = 'weekly') {
            const canvas = document.getElementById('progressChart');
            const ctx = canvas.getContext('2d');
            
            // Bersihkan canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Data dummy untuk visualisasi
            const days = period === 'weekly' ? 7 : 30;
            const data = [];
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toDateString();
                
                const completed = habits.filter(habit => 
                    habitHistory[habit.id] && habitHistory[habit.id].includes(dateStr)
                ).length;
                
                data.push({ date: date.getDate(), completed });
            }

            // Render chart sederhana
            const maxCompleted = Math.max(...data.map(d => d.completed), 1);
            const barWidth = canvas.width / data.length;
            const maxBarHeight = canvas.height - 40;

            ctx.fillStyle = '#667eea';
            data.forEach((point, index) => {
                const barHeight = (point.completed / maxCompleted) * maxBarHeight;
                const x = index * barWidth + 10;
                const y = canvas.height - barHeight - 20;
                
                ctx.fillRect(x, y, barWidth - 20, barHeight);
                
                // Label tanggal
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(point.date, x + (barWidth - 20) / 2, canvas.height - 5);
                
                // Label jumlah
                if (point.completed > 0) {
                    ctx.fillText(point.completed, x + (barWidth - 20) / 2, y - 5);
                }
                
                ctx.fillStyle = '#667eea';
            });
        }

        // Event listener untuk Enter key pada input
        document.getElementById('habitInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addHabit();
            }
        });