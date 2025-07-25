/* =============================================
   Gymmee - Pattern 02: Modern
   モダン版JavaScript
   インタラクティブ＆ゲーミフィケーション
   ============================================= */

// アプリケーションの状態管理
const AppState = {
    currentScreen: 'home',
    user: {
        name: '田中さん',
        level: 8,
        xp: 3450,
        xpNeeded: 5000,
        streak: 12,
        achievements: 45,
        weeklyCalories: 1280
    },
    workout: {
        inProgress: false,
        currentExercise: 0,
        currentSet: 1,
        heartRate: 142,
        calories: 45,
        elapsedTime: 0
    },
    animations: {
        particles: [],
        confetti: []
    }
};

// DOM要素のキャッシュ
const elements = {
    screens: {},
    navItems: {},
    buttons: {},
    metrics: {}
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Gymmee App - Pattern 04 初期化中...');
    
    // Ensure only home screen is active on initial load
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Set home screen as active
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen) {
        homeScreen.classList.add('active');
    }
    
    // プリローダーを表示
    showPreloader();
    
    // DOM要素をキャッシュ
    cacheElements();
    
    // デバッグ: キャッシュされた要素を確認
    console.log('Cached screens:', Object.keys(elements.screens));
    console.log('Nav items found:', document.querySelectorAll('.nav-item').length);
    
    // イベントリスナーを設定
    setupEventListeners();
    
    // アニメーションを初期化
    initializeAnimations();
    
    // 初期画面を表示
    setTimeout(() => {
        hidePreloader();
        showScreen('home');
        startBackgroundAnimations();
    }, 1500);
    
    console.log('✨ 初期化完了');
    
    // グローバルデバッグ関数を追加
    window.debugApp = () => {
        console.log('=== APP DEBUG INFO ===');
        console.log('Screens:', elements.screens);
        console.log('NavItems:', elements.navItems);
        console.log('Current Screen:', AppState.currentScreen);
        console.log('All screens in DOM:', document.querySelectorAll('.screen'));
        console.log('All nav items in DOM:', document.querySelectorAll('.nav-item'));
        
        // 各ナビゲーションアイテムの状態を確認
        document.querySelectorAll('.nav-item').forEach((item, index) => {
            console.log(`Nav item ${index}:`, {
                screen: item.dataset.screen,
                active: item.classList.contains('active'),
                element: item
            });
        });
    };
    
    // 手動で画面を切り替えるテスト関数
    window.testShowScreen = (screenName) => {
        console.log(`Testing showScreen('${screenName}')`);
        showScreen(screenName);
    };
    
    // ナビゲーションの問題を修正する関数
    window.fixNavigation = () => {
        console.log('Fixing navigation...');
        
        // 既存のイベントリスナーを削除
        document.querySelectorAll('.nav-item').forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
        });
        
        // 新しいイベントリスナーを追加
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const screen = item.dataset.screen;
                console.log('Fixed nav clicked:', screen);
                
                if (screen) {
                    showScreen(screen);
                    
                    // アクティブ状態を更新
                    document.querySelectorAll('.nav-item').forEach(navItem => {
                        navItem.classList.remove('active');
                    });
                    item.classList.add('active');
                }
            });
        });
        
        console.log('Navigation fixed!');
    };
    
    // 自動で修正を試みる
    setTimeout(() => {
        window.fixNavigation();
    }, 500);
});

// プリローダー表示
function showPreloader() {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(preloader);
}

// プリローダー非表示
function hidePreloader() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 300);
    }
}

// DOM要素のキャッシュ
function cacheElements() {
    // スクリーンを取得
    document.querySelectorAll('.screen').forEach(screen => {
        const id = screen.id.replace('-screen', '');
        elements.screens[id] = screen;
        console.log(`Cached screen: ${id} (original id: ${screen.id})`);
    });
    
    // ナビゲーションアイテムを取得
    document.querySelectorAll('.nav-item').forEach(item => {
        const screen = item.dataset.screen;
        if (screen) {
            elements.navItems[screen] = item;
            console.log(`Nav item for screen: ${screen}`);
        }
    });
    
    // メトリクス要素
    elements.metrics = {
        heartRate: document.querySelector('.metric-value'),
        calories: document.querySelectorAll('.metric-value')[1],
        timer: document.querySelectorAll('.metric-value')[2]
    };
}

// イベントリスナーの設定
function setupEventListeners() {
    // ボトムナビゲーション
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavClick);
    });
    
    // ホーム画面のボタン
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', handleHomeAction);
    });
    
    // プロフィールメニューのハンドラー
    document.querySelectorAll('.profile-menu .menu-item').forEach(item => {
        item.addEventListener('click', handleProfileMenuClick);
    });
    
    // Back buttons in new screens
    document.querySelectorAll('.btn-back[data-screen]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetScreen = e.currentTarget.dataset.screen;
            showScreen(targetScreen);
        });
    });
    
    // 設定ボタン（栄養ページ内）
    document.querySelectorAll('.btn-settings[data-screen]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetScreen = e.currentTarget.dataset.screen;
            showScreen(targetScreen);
        });
    });
    
    // FAB（フローティングアクションボタン）
    const fab = document.querySelector('.fab');
    if (fab) {
        fab.addEventListener('click', toggleFabMenu);
    }
    
    // ワークアウトコントロール
    const startSetBtn = document.getElementById('start-set-btn');
    if (startSetBtn) {
        startSetBtn.addEventListener('click', handleWorkoutControl);
    }
    
    // ビュートグル
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', handleViewToggle);
    });
    
    // ソーシャル機能
    document.querySelectorAll('.reaction-btn').forEach(btn => {
        btn.addEventListener('click', handleReaction);
    });
    
    // クイックアクション
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleQuickAction);
    });
    
    // ホットスポット
    document.querySelectorAll('.hotspot').forEach(spot => {
        spot.addEventListener('click', showHotspotInfo);
    });
    
    // エクササイズアイテムのスワイプ機能を初期化
    initializeExerciseSwipe();
    
    // 栄養管理ページの機能を初期化
    initializeNutritionPage();
}

// エクササイズアイテムのスワイプ機能
function initializeExerciseSwipe() {
    const exerciseItems = document.querySelectorAll('.exercise-item');
    
    exerciseItems.forEach(item => {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let isDragging = false;
        
        // Touch events
        item.addEventListener('touchstart', handleStart, { passive: true });
        item.addEventListener('touchmove', handleMove, { passive: false });
        item.addEventListener('touchend', handleEnd);
        
        // Mouse events for desktop testing
        item.addEventListener('mousedown', handleStart);
        item.addEventListener('mousemove', handleMove);
        item.addEventListener('mouseup', handleEnd);
        item.addEventListener('mouseleave', handleEnd);
        
        function handleStart(e) {
            isDragging = true;
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            item.style.transition = 'none';
        }
        
        function handleMove(e) {
            if (!isDragging) return;
            
            currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const diffX = currentX - startX;
            const diffY = Math.abs(currentY - startY);
            
            // Only allow horizontal swipes
            if (Math.abs(diffX) > diffY * 2) {
                e.preventDefault();
                item.style.transform = `translateX(${diffX}px)`;
                
                // Visual feedback
                if (diffX < -50) {
                    item.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'; // Green for complete
                } else if (diffX > 50) {
                    item.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; // Red for skip
                } else {
                    item.style.backgroundColor = '';
                }
            }
        }
        
        function handleEnd(e) {
            if (!isDragging) return;
            isDragging = false;
            
            const diffX = currentX - startX;
            item.style.transition = 'all 0.3s ease';
            
            if (diffX < -100) {
                // Left swipe - Complete
                completeExercise(item);
            } else if (diffX > 100) {
                // Right swipe - Skip
                skipExercise(item);
            } else {
                // Reset position
                item.style.transform = 'translateX(0)';
                item.style.backgroundColor = '';
            }
            
            startX = 0;
            currentX = 0;
        }
    });
}

// エクササイズ完了
function completeExercise(item) {
    item.style.transform = 'translateX(-100%)';
    
    setTimeout(() => {
        item.style.transform = 'translateX(0)';
        item.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
        
        // Add completion indicator with undo button
        let statusBadge = item.querySelector('.exercise-status');
        
        if (!statusBadge) {
            statusBadge = document.createElement('div');
            statusBadge.className = 'exercise-status complete';
            statusBadge.style.cssText = `
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: rgb(34, 197, 94);
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            item.style.position = 'relative';
            item.appendChild(statusBadge);
        }
        
        statusBadge.innerHTML = `
            <span style="display: flex; align-items: center; gap: 4px;">
                <i class="fas fa-check"></i> 完了
            </span>
            <button class="undo-btn" style="
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                cursor: pointer;
                font-size: 0.7rem;
                margin-left: 4px;
                transition: background 0.2s;
            ">
                取り消し
            </button>
        `;
        
        statusBadge.className = 'exercise-status complete';
        statusBadge.style.background = 'rgb(34, 197, 94)';
        
        // Add undo functionality
        const undoBtn = statusBadge.querySelector('.undo-btn');
        undoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            undoExerciseStatus(item);
        });
    }, 300);
}

// エクササイズスキップ
function skipExercise(item) {
    item.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        item.style.transform = 'translateX(0)';
        item.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        
        // Add skip indicator with undo button
        let statusBadge = item.querySelector('.exercise-status');
        
        if (!statusBadge) {
            statusBadge = document.createElement('div');
            statusBadge.className = 'exercise-status skip';
            statusBadge.style.cssText = `
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: rgb(239, 68, 68);
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            item.style.position = 'relative';
            item.appendChild(statusBadge);
        }
        
        statusBadge.innerHTML = `
            <span style="display: flex; align-items: center; gap: 4px;">
                <i class="fas fa-forward"></i> スキップ
            </span>
            <button class="undo-btn" style="
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                cursor: pointer;
                font-size: 0.7rem;
                margin-left: 4px;
                transition: background 0.2s;
            ">
                取り消し
            </button>
        `;
        
        statusBadge.className = 'exercise-status skip';
        statusBadge.style.background = 'rgb(239, 68, 68)';
        
        // Add undo functionality
        const undoBtn = statusBadge.querySelector('.undo-btn');
        undoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            undoExerciseStatus(item);
        });
    }, 300);
}

// エクササイズステータスを取り消し
function undoExerciseStatus(item) {
    // Remove status badge
    const statusBadge = item.querySelector('.exercise-status');
    if (statusBadge) {
        statusBadge.remove();
    }
    
    // Reset item appearance completely
    item.style.backgroundColor = '';
    item.style.opacity = '1';
    item.style.transform = 'translateX(0)';
    item.style.transition = 'all 0.3s ease';
    
    // Re-enable swipe functionality
    item.style.pointerEvents = 'auto';
}

// 栄養管理ページの初期化
function initializeNutritionPage() {
    // タブ機能の初期化
    const tabBtns = document.querySelectorAll('.nutrition-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab + '-tab-content');
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Re-initialize features based on active tab
            if (targetTab === 'supplement') {
                initializeSupplementFeatures();
            }
        });
    });
    
    // 水分摂取ボタン
    const waterAddBtns = document.querySelectorAll('.water-add-btn');
    waterAddBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const amount = parseInt(this.dataset.amount);
            updateWaterIntake(amount);
        });
    });
    
    // 日付ナビゲーション
    const dateNavBtns = document.querySelectorAll('.date-nav-btn');
    dateNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 日付切り替えロジック（デモ用）
            const currentDate = document.querySelector('.current-date');
            if (this.querySelector('.fa-chevron-left')) {
                currentDate.textContent = '昨日 • 1月23日';
            } else {
                currentDate.textContent = '明日 • 1月25日';
            }
        });
    });
    
    // クイック追加ボタン
    const quickAddBtns = document.querySelectorAll('.quick-add-btn');
    quickAddBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i').className;
            let message = '';
            
            if (icon.includes('camera')) {
                message = '📸 カメラが起動します';
            } else if (icon.includes('barcode')) {
                message = '📊 バーコードスキャナーが起動します';
            } else if (icon.includes('search')) {
                message = '🔍 食品検索画面を開きます';
            } else if (icon.includes('history')) {
                message = '📝 履歴から選択します';
            }
            
            // 一時的なフィードバック
            showTemporaryMessage(message);
        });
    });
    
    // 食事追加ボタン
    const addMealBtn = document.querySelector('.btn-add-meal');
    if (addMealBtn) {
        addMealBtn.addEventListener('click', function() {
            showTemporaryMessage('🍽️ 食事追加画面を開きます');
        });
    }
    
    // サプリメント機能を初期化
    initializeSupplementFeatures();
}

// 水分摂取量の更新
function updateWaterIntake(amount) {
    const waterLevel = document.querySelector('.water-level');
    const hydrationAmount = document.querySelector('.hydration-current .amount');
    
    // 現在の摂取量を取得
    let currentAmount = parseFloat(hydrationAmount.textContent) * 1000; // L to ml
    currentAmount += amount;
    
    // 最大2Lまで
    if (currentAmount > 2000) currentAmount = 2000;
    
    // UIを更新
    const percentage = (currentAmount / 2000) * 100;
    waterLevel.style.height = percentage + '%';
    hydrationAmount.textContent = (currentAmount / 1000).toFixed(2);
    
    // アニメーション効果
    waterLevel.style.transition = 'height 0.5s ease';
    
    // フィードバック
    showTemporaryMessage(`💧 ${amount}ml追加しました`);
}

// サプリメント機能の初期化
function initializeSupplementFeatures() {
    // サプリメント追加ボタンのハンドラを追加
    const supplementCamera = document.querySelector('.supplement-quick-add button[onclick="showSupplementCamera()"]');
    const supplementBarcode = document.querySelector('.supplement-quick-add button[onclick="showSupplementBarcode()"]');
    const supplementSearch = document.querySelector('.supplement-quick-add button[onclick="showSupplementSearch()"]');
    const supplementHistory = document.querySelector('.supplement-quick-add button[onclick="showSupplementHistory()"]');
    
    if (supplementCamera) {
        supplementCamera.onclick = function() {
            showTemporaryMessage('📸 カメラでサプリメントを撮影します');
        };
    }
    
    if (supplementBarcode) {
        supplementBarcode.onclick = function() {
            showTemporaryMessage('📊 バーコードスキャナーを起動します');
        };
    }
    
    if (supplementSearch) {
        supplementSearch.onclick = function() {
            showTemporaryMessage('🔍 サプリメント検索画面を開きます');
        };
    }
    
    if (supplementHistory) {
        supplementHistory.onclick = function() {
            showTemporaryMessage('📋 履歴からサプリメントを選択します');
        };
    }
    
    // チェックボタン
    const checkBtns = document.querySelectorAll('.supplement-card .check-btn');
    checkBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.supplement-card');
            const isChecked = this.classList.contains('checked');
            
            if (!isChecked) {
                this.classList.add('checked');
                this.innerHTML = '<i class="fas fa-check"></i>';
                card.classList.add('completed');
                updateSupplementProgress();
                showTemporaryMessage('💊 サプリメントを摂取しました');
            } else {
                this.classList.remove('checked');
                this.innerHTML = '<i class="far fa-circle"></i>';
                card.classList.remove('completed');
                updateSupplementProgress();
            }
        });
    });
    
    // アラームボタン
    const alarmBtns = document.querySelectorAll('.alarm-btn');
    alarmBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            const isActive = this.classList.contains('active');
            
            if (isActive) {
                this.innerHTML = '<i class="fas fa-bell"></i>';
                showTemporaryMessage('🔔 リマインダーをオンにしました');
            } else {
                this.innerHTML = '<i class="far fa-bell"></i>';
                showTemporaryMessage('🔕 リマインダーをオフにしました');
            }
        });
    });
    
    // 情報ボタン
    const infoBtns = document.querySelectorAll('.info-btn');
    infoBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.supplement-card');
            const name = card.querySelector('h5').textContent;
            showTemporaryMessage(`ℹ️ ${name}の詳細情報を表示`);
        });
    });
    
    // サプリメント追加ボタン
    const addSupplementBtn = document.querySelector('.btn-supplement-add');
    if (addSupplementBtn) {
        addSupplementBtn.addEventListener('click', function() {
            showTemporaryMessage('➕ サプリメント追加画面を開きます');
        });
    }
    
    // 設定ボタン
    const settingsBtn = document.querySelector('.btn-supplement-settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            showTemporaryMessage('⚙️ サプリメント設定画面を開きます');
        });
    }
    
    // 再注文ボタン
    const reorderBtns = document.querySelectorAll('.reorder-btn');
    reorderBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productName = this.closest('.inventory-card').querySelector('h5').textContent;
            if (this.classList.contains('urgent')) {
                showTemporaryMessage(`🚨 ${productName}を緊急注文します`);
            } else {
                showTemporaryMessage(`🛒 ${productName}を再注文します`);
            }
        });
    });
    
    // AI Suggest機能
    const uploadBtn = document.querySelector('.btn-upload-image');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            // シミュレーション: 3秒後に分析結果を表示
            showTemporaryMessage('🤖 画像を分析中...');
            
            setTimeout(() => {
                const uploadArea = document.querySelector('.suggest-upload-area');
                const resultsArea = document.querySelector('.suggest-results');
                
                if (uploadArea && resultsArea) {
                    uploadArea.style.display = 'none';
                    resultsArea.style.display = 'block';
                    showTemporaryMessage('✅ 分析完了！最適な商品を提案しました');
                }
            }, 3000);
        });
    }
}

// サプリメント進捗の更新
function updateSupplementProgress() {
    const totalCards = document.querySelectorAll('.supplement-card').length;
    const completedCards = document.querySelectorAll('.supplement-card.completed').length;
    const percentage = (completedCards / totalCards) * 100;
    const circumference = 314; // 2 * π * 50
    const offset = circumference - (percentage / 100) * circumference;
    
    // 円グラフを更新
    const progressCircle = document.querySelector('.supplement-overview .stat-circle circle:last-child');
    if (progressCircle) {
        progressCircle.style.strokeDashoffset = offset;
    }
    
    // 数値を更新
    const statValue = document.querySelector('.supplement-overview .stat-value');
    if (statValue) {
        statValue.textContent = `${completedCards}/${totalCards}`;
    }
}

// 一時的なメッセージ表示
function showTemporaryMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'temporary-message';
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => messageEl.remove(), 300);
    }, 2000);
}

// アニメーション初期化
function initializeAnimations() {
    // パーティクルシステムの初期化
    initParticleSystem();
    
    // チャート描画
    drawPerformanceChart();
    
    // レベルアップエフェクトの準備
    prepareRewardEffects();
}

// ナビゲーションクリックハンドラ
function handleNavClick(e) {
    e.preventDefault(); // Prevent any default button behavior
    e.stopPropagation(); // Stop event from bubbling up
    
    const navItem = e.currentTarget;
    const screen = navItem.dataset.screen;
    
    console.log('Navigation clicked:', screen); // デバッグ用
    console.log('Available screens:', Object.keys(elements.screens)); // デバッグ用
    
    if (screen) {
        // 振動フィードバック
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
        
        showScreen(screen);
        
        // アクティブ状態を更新
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        navItem.classList.add('active');
        
        // ナビゲーションアニメーション
        animateNavTransition(navItem);
    }
}


// 画面表示
function showScreen(screenName) {
    console.log(`🎬 画面切替: ${screenName}`);
    console.log('Available screens:', Object.keys(elements.screens)); // デバッグ用
    
    // すべての画面を非表示
    Object.values(elements.screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 指定された画面を表示
    if (elements.screens[screenName]) {
        elements.screens[screenName].classList.add('active');
        AppState.currentScreen = screenName;
        
        // 画面固有の初期化
        initializeScreen(screenName);
        
        // 画面遷移エフェクト
        playScreenTransition();
    } else {
        console.error(`Screen not found: ${screenName}`);
    }
}

// 画面固有の初期化
function initializeScreen(screenName) {
    switch (screenName) {
        case 'home':
            updateHomeScreen();
            animateStats();
            break;
        case 'profile':
            updateProgressScreen();
            animateCharts();
            break;
        case 'workout':
            if (!AppState.workout.inProgress) {
                // Show workout selection mode
                const selectionMode = document.querySelector('.workout-selection-mode');
                const executionMode = document.querySelector('.workout-execution-mode');
                if (selectionMode) selectionMode.style.display = 'block';
                if (executionMode) executionMode.style.display = 'none';
            } else {
                initializeWorkoutExecution();
            }
            break;
    }
}

// ホーム画面の更新
function updateHomeScreen() {
    // 時刻に応じた挨拶
    const now = new Date();
    const hour = now.getHours();
    const greetingText = document.querySelector('.greeting-text');
    
    if (greetingText) {
        let greeting = 'Good Day';
        if (hour < 12) greeting = 'Good Morning';
        else if (hour < 18) greeting = 'Good Afternoon';
        else greeting = 'Good Evening';
        
        greetingText.textContent = greeting;
    }
    
    // ストリーク更新
    updateStreak();
    
    // モチベーションクォート
    updateMotivationalQuote();
}

// ストリーク更新
function updateStreak() {
    const streakCount = document.querySelector('.streak-count');
    if (streakCount) {
        streakCount.textContent = AppState.user.streak;
        
        // ストリークが10日以上なら特別なエフェクト
        if (AppState.user.streak >= 10) {
            streakCount.parentElement.classList.add('pulse');
        }
    }
}

// モチベーションクォート更新
function updateMotivationalQuote() {
    const quotes = [
        "今日も一歩前進！限界を超えよう",
        "強さは心から生まれる",
        "昨日の自分を超えていけ",
        "努力は必ず報われる",
        "最高の投資は自分への投資"
    ];
    
    const quoteElement = document.querySelector('.motivational-quote');
    if (quoteElement) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteElement.textContent = `"${randomQuote}"`;
    }
}

// ホームアクションハンドラー
function handleHomeAction(e) {
    const action = e.currentTarget.dataset.action;
    
    switch(action) {
        case 'view-plan':
            viewTodaysPlan();
            break;
        case 'start-workout':
            startTodaysWorkout();
            break;
        default:
            console.log(`Unknown action: ${action}`);
    }
}

// 今日のプランを見る
function viewTodaysPlan() {
    console.log('📋 今日のプランを表示');
    
    // プラン詳細モーダルを表示
    showPlanDetails();
}

// 今日のワークアウトを開始
function startTodaysWorkout() {
    console.log('🎯 ワークアウト開始！');
    
    // ボタンアニメーション
    const btn = event.currentTarget;
    if (event && btn) {
        createRippleEffect(btn, event);
    }
    
    // ワークアウトを開始
    AppState.workout.inProgress = true;
    AppState.workout.currentExercise = 0;
    AppState.workout.currentSet = 0;
    
    // Show execution mode, hide selection mode
    const selectionMode = document.querySelector('.workout-selection-mode');
    const executionMode = document.querySelector('.workout-execution-mode');
    if (selectionMode) selectionMode.style.display = 'none';
    if (executionMode) executionMode.style.display = 'block';
    
    // Initialize workout execution
    initializeWorkoutExecution();
    
    // 通知
    showNotification('ワークアウト開始！', '今日も頑張りましょう！', 'success');
}

// プラン詳細表示
function showPlanDetails() {
    const modal = document.createElement('div');
    modal.className = 'plan-details-modal';
    modal.innerHTML = `
        <div class="modal-content glass-card">
            <h2>今日のトレーニングプラン</h2>
            <div class="plan-exercises">
                <div class="exercise-item">
                    <span class="exercise-number">1</span>
                    <div class="exercise-info">
                        <h4>バーベルスクワット</h4>
                        <p>4セット × 8-10回 | 80kg</p>
                    </div>
                </div>
                <div class="exercise-item">
                    <span class="exercise-number">2</span>
                    <div class="exercise-info">
                        <h4>ルーマニアンデッドリフト</h4>
                        <p>3セット × 12回 | 60kg</p>
                    </div>
                </div>
                <div class="exercise-item">
                    <span class="exercise-number">3</span>
                    <div class="exercise-info">
                        <h4>レッグプレス</h4>
                        <p>3セット × 12-15回 | 120kg</p>
                    </div>
                </div>
                <div class="exercise-item">
                    <span class="exercise-number">4</span>
                    <div class="exercise-info">
                        <h4>レッグカール</h4>
                        <p>3セット × 15回 | 40kg</p>
                    </div>
                </div>
                <div class="exercise-item">
                    <span class="exercise-number">5</span>
                    <div class="exercise-info">
                        <h4>カーフレイズ</h4>
                        <p>4セット × 20回 | 自重</p>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="closePlanDetails()">閉じる</button>
                <button class="btn btn-primary" onclick="closePlanDetails(); startTodaysWorkout();">開始する</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
}

// プラン詳細を閉じる
window.closePlanDetails = function() {
    const modal = document.querySelector('.plan-details-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => modal.remove(), 300);
    }
};

// リップルエフェクト
function createRippleEffect(element, event) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// XP獲得アニメーション
function showXPGain(amount) {
    const xpPopup = document.createElement('div');
    xpPopup.className = 'xp-popup';
    xpPopup.innerHTML = `+${amount} XP`;
    
    xpPopup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        font-weight: 800;
        color: #667eea;
        z-index: 9999;
        animation: xpFloat 2s ease-out forwards;
    `;
    
    document.body.appendChild(xpPopup);
    
    // パーティクルエフェクト
    createParticles(xpPopup);
    
    setTimeout(() => xpPopup.remove(), 2000);
    
    // XPを実際に追加
    updateUserXP(amount);
}

// パーティクル生成
function createParticles(element) {
    const colors = ['#FF6B35', '#667eea', '#f5576c', '#00d4ff'];
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;
        const duration = Math.random() * 2 + 1;
        const delay = Math.random() * 0.5;
        const angle = Math.random() * 360;
        const distance = Math.random() * 100 + 50;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: particleFly ${duration}s ${delay}s ease-out forwards;
            --angle: ${angle}deg;
            --distance: ${distance}px;
        `;
        
        element.appendChild(particle);
    }
}

// ワークアウトコントロール
function handleWorkoutControl() {
    const btn = event.currentTarget;
    const btnText = btn.querySelector('span');
    
    if (btnText.textContent === 'セット開始') {
        startSet();
    } else {
        completeSet();
    }
}

// ワークアウト実行の初期化
function initializeWorkoutExecution() {
    console.log('🏋️ ワークアウト実行画面初期化');
    
    // 現在のエクササイズ情報を表示
    updateExerciseDisplay();
    
    // 記録フォームは初期非表示
    const recordingForm = document.querySelector('.recording-form');
    if (recordingForm) {
        recordingForm.style.display = 'none';
    }
    
    // 休憩タイマーも初期非表示
    const restTimer = document.querySelector('.rest-timer');
    if (restTimer) {
        restTimer.style.display = 'none';
    }
}

// エクササイズ表示の更新
function updateExerciseDisplay() {
    const exercises = [
        { name: 'バーベルスクワット', sets: 4, reps: '8-10', weight: 80 },
        { name: 'ルーマニアンデッドリフト', sets: 3, reps: '12', weight: 60 },
        { name: 'レッグプレス', sets: 3, reps: '12-15', weight: 120 },
        { name: 'レッグカール', sets: 3, reps: '15', weight: 40 },
        { name: 'カーフレイズ', sets: 4, reps: '20', weight: 0 }
    ];
    
    const currentEx = exercises[AppState.workout.currentExercise];
    
    // エクササイズ名
    const exerciseName = document.querySelector('.exercise-name');
    if (exerciseName) {
        exerciseName.textContent = currentEx.name;
    }
    
    // セット情報
    const setInfo = document.querySelector('.set-info h3');
    if (setInfo) {
        setInfo.textContent = `セット ${AppState.workout.currentSet + 1}/${currentEx.sets}`;
    }
    
    // 重量と回数
    const details = document.querySelectorAll('.set-details .value');
    if (details.length >= 2) {
        details[0].textContent = currentEx.reps + '回';
        details[1].textContent = currentEx.weight ? currentEx.weight + ' kg' : '自重';
    }
    
    // プログレスバー更新
    updateExerciseProgress();
}

// セット開始
function startSet() {
    console.log('💪 セット開始');
    
    // ボタン更新
    const btn = document.querySelector('#start-set-btn .btn-content span');
    if (btn) {
        btn.textContent = 'セット完了';
    }
    
    // タイマー開始
    startWorkoutTimer();
    
    // 3Dモデルアニメーション
    animate3DModel();
}

// ワークアウトタイマー
function startWorkoutTimer() {
    let seconds = 0;
    
    AppState.workout.timer = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        
        if (elements.metrics.timer) {
            elements.metrics.timer.textContent = 
                `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
        
        // カロリー計算（簡易）
        AppState.workout.calories = Math.floor(seconds * 0.15);
        if (elements.metrics.calories) {
            elements.metrics.calories.textContent = AppState.workout.calories;
        }
    }, 1000);
}

// メトリクスアニメーション
function animateMetrics() {
    // 心拍数シミュレーション
    setInterval(() => {
        const variance = Math.random() * 10 - 5;
        AppState.workout.heartRate = Math.round(142 + variance);
        
        if (elements.metrics.heartRate) {
            elements.metrics.heartRate.textContent = AppState.workout.heartRate;
        }
    }, 2000);
}

// 3Dモデルアニメーション
function animate3DModel() {
    const model = document.querySelector('.exercise-model');
    if (model) {
        model.style.animation = 'modelRotate 20s linear infinite';
    }
}

// セット完了
function completeSet() {
    console.log('✅ セット完了');
    
    clearInterval(AppState.workout.timer);
    
    // 記録フォームを表示
    showRecordingForm();
}

// 記録フォームを表示
function showRecordingForm() {
    const recordingForm = document.querySelector('.recording-form');
    const controlButtons = document.querySelector('.workout-controls-modern');
    
    if (recordingForm && controlButtons) {
        controlButtons.style.display = 'none';
        recordingForm.style.display = 'block';
        
        // 記録完了ボタンのイベントリスナー
        const recordBtn = recordingForm.querySelector('.btn-primary');
        if (recordBtn && !recordBtn.hasListener) {
            recordBtn.hasListener = true;
            recordBtn.addEventListener('click', completeRecording);
        }
    }
}

// 記録完了
function completeRecording() {
    console.log('📝 記録完了');
    
    const recordingForm = document.querySelector('.recording-form');
    const controlButtons = document.querySelector('.workout-controls-modern');
    
    // フォームを非表示
    if (recordingForm) {
        recordingForm.style.display = 'none';
    }
    
    // 現在のセットを完了マーク
    AppState.workout.currentSet++;
    
    const exercises = [
        { name: 'バーベルスクワット', sets: 4 },
        { name: 'ルーマニアンデッドリフト', sets: 3 },
        { name: 'レッグプレス', sets: 3 },
        { name: 'レッグカール', sets: 3 },
        { name: 'カーフレイズ', sets: 4 }
    ];
    
    const currentEx = exercises[AppState.workout.currentExercise];
    
    if (AppState.workout.currentSet >= currentEx.sets) {
        // エクササイズ完了
        AppState.workout.currentExercise++;
        AppState.workout.currentSet = 0;
        
        if (AppState.workout.currentExercise >= exercises.length) {
            // ワークアウト完了
            completeWorkout();
        } else {
            // 次のエクササイズへ
            showNotification('エクササイズ完了！', '次のエクササイズに進みます', 'success');
            updateExerciseDisplay();
            if (controlButtons) {
                controlButtons.style.display = 'flex';
            }
            const btn = document.querySelector('#start-set-btn .btn-content span');
            if (btn) {
                btn.textContent = 'セット開始';
            }
        }
    } else {
        // 休憩タイマーを表示
        showRestTimer();
    }
}

// 休憩タイマー表示
function showRestTimer() {
    const restTimer = document.querySelector('.rest-timer');
    const controlButtons = document.querySelector('.workout-controls-modern');
    
    if (restTimer && controlButtons) {
        controlButtons.style.display = 'none';
        restTimer.style.display = 'block';
        
        let seconds = 90;
        const timeDisplay = restTimer.querySelector('.time');
        
        const restInterval = setInterval(() => {
            seconds--;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            if (timeDisplay) {
                timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            }
            
            if (seconds <= 0) {
                clearInterval(restInterval);
                endRest();
            }
        }, 1000);
        
        // スキップボタン
        const skipBtn = restTimer.querySelector('.btn-secondary');
        if (skipBtn && !skipBtn.hasListener) {
            skipBtn.hasListener = true;
            skipBtn.addEventListener('click', () => {
                clearInterval(restInterval);
                endRest();
            });
        }
    }
}

// 休憩終了
function endRest() {
    const restTimer = document.querySelector('.rest-timer');
    const controlButtons = document.querySelector('.workout-controls-modern');
    
    if (restTimer) {
        restTimer.style.display = 'none';
    }
    
    if (controlButtons) {
        controlButtons.style.display = 'flex';
    }
    
    const btn = document.querySelector('#start-set-btn .btn-content span');
    if (btn) {
        btn.textContent = 'セット開始';
    }
    
    updateExerciseDisplay();
    showNotification('休憩終了', '次のセットを開始しましょう！', 'info');
}

// エクササイズプログレス更新
function updateExerciseProgress() {
    const steps = document.querySelectorAll('.exercise-progress-bar .step');
    steps.forEach((step, index) => {
        if (index < AppState.workout.currentExercise) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index === AppState.workout.currentExercise) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
    
    const progressFill = document.querySelector('.exercise-progress-bar .progress-fill');
    if (progressFill) {
        const percentage = (AppState.workout.currentExercise / 5) * 100;
        progressFill.style.width = `${percentage}%`;
    }
}

// セット完了エフェクト
function showSetCompleteEffect() {
    // コンフェッティエフェクト
    createConfetti();
    
    // サウンドエフェクト（実装省略）
    // playSound('success');
    
    // 振動フィードバック
    if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
    }
}

// コンフェッティエフェクト
function createConfetti() {
    const colors = ['#FF6B35', '#667eea', '#f5576c', '#00d4ff', '#FFD93D'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 2;
        const animationDelay = Math.random() * 0.5;
        
        confetti.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${left}%;
            top: -20px;
            opacity: 0.8;
            animation: confettiFall ${animationDuration}s ${animationDelay}s ease-out forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), (animationDuration + animationDelay) * 1000);
    }
}

// ワークアウト完了
function completeWorkout() {
    console.log('🎉 ワークアウト完了！');
    
    AppState.workout.inProgress = false;
    
    // Show selection mode, hide execution mode
    const selectionMode = document.querySelector('.workout-selection-mode');
    const executionMode = document.querySelector('.workout-execution-mode');
    if (selectionMode) selectionMode.style.display = 'block';
    if (executionMode) executionMode.style.display = 'none';
    
    // 実績解除チェック
    checkAchievements();
    
    // レベルアップチェック
    const xpGained = 500;
    if (updateUserXP(xpGained)) {
        showLevelUpEffect();
    }
    
    // 完了画面表示
    showWorkoutComplete();
}

// 実績チェック
function checkAchievements() {
    const newAchievements = [];
    
    // ストリーク実績
    if (AppState.user.streak === 10) {
        newAchievements.push({
            name: '炎の継続者',
            description: '10日連続達成',
            icon: 'fa-fire',
            rarity: 'rare'
        });
    }
    
    // カロリー実績
    if (AppState.user.weeklyCalories >= 1000) {
        newAchievements.push({
            name: 'カロリーバーナー',
            description: '週間1000kcal達成',
            icon: 'fa-burn',
            rarity: 'common'
        });
    }
    
    // 実績解除アニメーション
    newAchievements.forEach((achievement, index) => {
        setTimeout(() => {
            showAchievementUnlock(achievement);
        }, index * 1000);
    });
}

// 実績解除表示
function showAchievementUnlock(achievement) {
    const modal = document.createElement('div');
    modal.className = 'achievement-unlock-modal';
    
    modal.innerHTML = `
        <div class="achievement-unlock-content">
            <div class="unlock-shine"></div>
            <div class="unlock-icon ${achievement.rarity}">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <h3>実績解除！</h3>
            <p class="unlock-name">${achievement.name}</p>
            <p class="unlock-desc">${achievement.description}</p>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
    
    // 効果音
    // playSound('achievement');
    
    setTimeout(() => {
        modal.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => modal.remove(), 300);
    }, 3000);
}

// XP更新
function updateUserXP(amount) {
    AppState.user.xp += amount;
    
    // レベルアップチェック
    if (AppState.user.xp >= AppState.user.xpNeeded) {
        AppState.user.level++;
        AppState.user.xp -= AppState.user.xpNeeded;
        AppState.user.xpNeeded = Math.floor(AppState.user.xpNeeded * 1.2);
        return true;
    }
    
    return false;
}

// レベルアップエフェクト
function showLevelUpEffect() {
    console.log('🎊 レベルアップ！');
    
    const levelUpModal = document.createElement('div');
    levelUpModal.className = 'level-up-modal';
    
    levelUpModal.innerHTML = `
        <div class="level-up-content">
            <div class="level-up-glow"></div>
            <div class="level-up-number">${AppState.user.level}</div>
            <h2>LEVEL UP!</h2>
            <p>新しい力を手に入れた！</p>
        </div>
    `;
    
    document.body.appendChild(levelUpModal);
    
    // 大量のパーティクル
    for (let i = 0; i < 100; i++) {
        createLevelUpParticle();
    }
    
    setTimeout(() => levelUpModal.remove(), 4000);
}

// レベルアップパーティクル
function createLevelUpParticle() {
    const particle = document.createElement('div');
    particle.className = 'level-particle';
    
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + 20;
    const endX = startX + (Math.random() - 0.5) * 200;
    const endY = Math.random() * window.innerHeight;
    const duration = Math.random() * 3 + 2;
    const size = Math.random() * 20 + 10;
    
    particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
        border-radius: 50%;
        left: ${startX}px;
        top: ${startY}px;
        pointer-events: none;
        animation: levelParticleFloat ${duration}s ease-out forwards;
        --endX: ${endX}px;
        --endY: ${endY}px;
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => particle.remove(), duration * 1000);
}

// ワークアウト完了画面
function showWorkoutComplete() {
    const completeScreen = document.createElement('div');
    completeScreen.className = 'workout-complete-screen';
    
    completeScreen.innerHTML = `
        <div class="complete-content">
            <div class="complete-hero">
                <div class="hero-glow"></div>
                <div class="hero-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <h1>素晴らしい！</h1>
                <p>今日のチャレンジを完了しました</p>
            </div>
            
            <div class="complete-stats">
                <div class="stat-item">
                    <span class="stat-icon"><i class="fas fa-clock"></i></span>
                    <span class="stat-value">45:30</span>
                    <span class="stat-label">運動時間</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon"><i class="fas fa-fire"></i></span>
                    <span class="stat-value">320</span>
                    <span class="stat-label">消費カロリー</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon"><i class="fas fa-bolt"></i></span>
                    <span class="stat-value">+500</span>
                    <span class="stat-label">獲得XP</span>
                </div>
            </div>
            
            <div class="complete-actions">
                <button class="btn-share">
                    <i class="fas fa-share"></i>
                    シェアする
                </button>
                <button class="btn-continue" onclick="closeWorkoutComplete()">
                    続ける
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(completeScreen);
    
    // アニメーション
    setTimeout(() => {
        completeScreen.classList.add('show');
    }, 100);
}

// ワークアウト完了画面を閉じる
window.closeWorkoutComplete = function() {
    const screen = document.querySelector('.workout-complete-screen');
    if (screen) {
        screen.classList.remove('show');
        setTimeout(() => {
            screen.remove();
            showScreen('home');
        }, 300);
    }
};

// 進捗画面更新
function updateProgressScreen() {
    // XPバー更新
    const xpFill = document.querySelector('.xp-fill');
    if (xpFill) {
        const percentage = (AppState.user.xp / AppState.user.xpNeeded) * 100;
        xpFill.style.width = `${percentage}%`;
    }
    
    // レベル表示更新
    const levelNumber = document.querySelector('.level-number');
    if (levelNumber) {
        levelNumber.textContent = AppState.user.level;
    }
    
    // XP情報更新
    const xpCurrent = document.querySelector('.xp-current');
    if (xpCurrent) {
        xpCurrent.textContent = `${AppState.user.xp} / ${AppState.user.xpNeeded} XP`;
    }
}

// チャートアニメーション
function animateCharts() {
    // 既存のチャート描画に加えてアニメーション
    const chartPoints = document.querySelectorAll('.chart-point');
    chartPoints.forEach((point, index) => {
        setTimeout(() => {
            point.style.animation = 'chartPointAppear 0.5s ease forwards';
        }, index * 100);
    });
}

// パフォーマンスチャート描画
function drawPerformanceChart() {
    const canvas = document.getElementById('performance-chart') || document.getElementById('performance-chart-profile');
    if (!canvas || !canvas.getContext) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    // グラデーション背景
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, 'rgba(255, 107, 53, 0)');
    gradient.addColorStop(1, 'rgba(255, 107, 53, 0.3)');
    
    // データポイント
    const data = [40, 45, 42, 48, 52, 50, 55, 60, 58, 65, 70, 75];
    const stepX = width / (data.length - 1);
    const maxValue = Math.max(...data);
    
    ctx.clearRect(0, 0, width, height);
    
    // グリッドライン
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // データライン
    ctx.beginPath();
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 3;
    
    data.forEach((value, index) => {
        const x = index * stepX;
        const y = height - (value / maxValue * height * 0.8 + height * 0.1);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // 塗りつぶし
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // データポイント
    data.forEach((value, index) => {
        const x = index * stepX;
        const y = height - (value / maxValue * height * 0.8 + height * 0.1);
        
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 光るエフェクト
        ctx.fillStyle = 'rgba(255, 107, 53, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 通知表示
function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-circle',
        error: 'fa-times-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: white;
        max-width: 300px;
        z-index: 9998;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // スライドイン
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自動削除
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// FABメニュー切り替え
function toggleFabMenu() {
    const fab = document.querySelector('.fab');
    fab.classList.toggle('active');
}

// ビュートグル
function handleViewToggle(e) {
    const btn = e.currentTarget;
    
    document.querySelectorAll('.toggle-btn').forEach(b => {
        b.classList.remove('active');
    });
    
    btn.classList.add('active');
    
    // ビューに応じてチャートを更新
    const view = btn.textContent;
    console.log(`ビュー切替: ${view}`);
    
    // チャート再描画
    drawPerformanceChart();
}

// リアクション処理
function handleReaction(e) {
    const btn = e.currentTarget;
    
    // アニメーション
    btn.style.transform = 'scale(1.5) rotate(20deg)';
    btn.style.color = '#FF6B35';
    
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 300);
    
    // ハートフロート
    createFloatingHeart(btn);
}

// フローティングハート
function createFloatingHeart(element) {
    const heart = document.createElement('div');
    heart.innerHTML = '<i class="fas fa-heart"></i>';
    heart.style.cssText = `
        position: absolute;
        color: #FF6B35;
        font-size: 20px;
        pointer-events: none;
        animation: floatHeart 2s ease-out forwards;
    `;
    
    element.appendChild(heart);
    
    setTimeout(() => heart.remove(), 2000);
}

// クイックアクション処理
function handleQuickAction(e) {
    const btn = e.currentTarget;
    const action = btn.querySelector('span').textContent;
    
    console.log(`クイックアクション: ${action}`);
    
    // アクションに応じた処理
    switch (action) {
        case 'AIコーチ':
            showAICoach();
            break;
        case '栄養管理':
            showNutrition();
            break;
        case 'コミュニティ':
            showCommunity();
            break;
        case 'リーダーボード':
            showLeaderboard();
            break;
    }
}

// AIコーチ表示
function showAICoach() {
    showNotification('AIコーチ', 'あなたのフォームを分析中...', 'info');
}

// 栄養管理表示
function showNutrition() {
    showNotification('栄養管理', '今日の摂取カロリー: 1,850kcal', 'info');
}

// コミュニティ表示
function showCommunity() {
    showNotification('コミュニティ', '新しいチャレンジが3件あります', 'info');
}

// リーダーボード表示
function showLeaderboard() {
    showNotification('リーダーボード', 'あなたは週間ランキング5位です！', 'success');
}

// ホットスポット情報表示
function showHotspotInfo(e) {
    const hotspot = e.currentTarget;
    const tooltip = hotspot.querySelector('.hotspot-tooltip');
    
    // 情報モーダル表示
    const info = tooltip.textContent;
    showNotification('フォームポイント', info, 'info');
}

// 統計アニメーション
function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach((stat, index) => {
        const finalValue = parseInt(stat.textContent);
        let currentValue = 0;
        const increment = finalValue / 30;
        
        const counter = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(counter);
            }
            
            stat.textContent = Math.floor(currentValue).toLocaleString();
        }, 50);
    });
}

// ナビゲーショントランジション
function animateNavTransition(navItem) {
    const indicator = navItem.querySelector('.nav-indicator');
    if (indicator) {
        indicator.style.animation = 'indicatorGrow 0.3s ease';
    }
}

// 画面遷移エフェクト
function playScreenTransition() {
    const screen = document.querySelector('.screen.active');
    if (screen) {
        screen.style.animation = 'none';
        setTimeout(() => {
            screen.style.animation = 'screenSlideIn 0.5s ease';
        }, 10);
    }
}

// バックグラウンドアニメーション
function startBackgroundAnimations() {
    // パーティクルシステム
    setInterval(() => {
        createBackgroundParticle();
    }, 3000);
}

// バックグラウンドパーティクル
function createBackgroundParticle() {
    const particle = document.createElement('div');
    particle.className = 'bg-particle';
    
    const size = Math.random() * 4 + 2;
    const duration = Math.random() * 20 + 10;
    const startX = Math.random() * window.innerWidth;
    
    particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        left: ${startX}px;
        bottom: -10px;
        pointer-events: none;
        animation: bgParticleFloat ${duration}s linear forwards;
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => particle.remove(), duration * 1000);
}

// パーティクルシステム初期化
function initParticleSystem() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes xpFloat {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
            50% {
                transform: translate(-50%, -100%) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -200%) scale(0.5);
                opacity: 0;
            }
        }
        
        @keyframes particleFly {
            to {
                transform: translate(
                    calc(-50% + var(--distance) * cos(var(--angle))),
                    calc(-50% + var(--distance) * sin(var(--angle)))
                ) scale(0);
                opacity: 0;
            }
        }
        
        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
        
        @keyframes levelParticleFloat {
            to {
                left: var(--endX);
                top: var(--endY);
                opacity: 0;
            }
        }
        
        @keyframes floatHeart {
            to {
                transform: translateY(-50px) scale(0);
                opacity: 0;
            }
        }
        
        @keyframes bgParticleFloat {
            to {
                transform: translateY(-100vh) translateX(50px);
                opacity: 0;
            }
        }
        
        @keyframes chartPointAppear {
            from {
                transform: scale(0);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        @keyframes indicatorGrow {
            0% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.5); }
            100% { transform: translateX(-50%) scale(1); }
        }
        
        @keyframes modelRotate {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes rippleEffect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .workout-complete-screen {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .workout-complete-screen.show {
            opacity: 1;
        }
        
        .complete-content {
            text-align: center;
            color: white;
            padding: 40px;
        }
        
        .complete-hero {
            margin-bottom: 40px;
        }
        
        .hero-glow {
            position: absolute;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(255, 107, 53, 0.3) 0%, transparent 70%);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: pulse 2s infinite;
        }
        
        .hero-icon {
            font-size: 80px;
            color: #FFD700;
            margin-bottom: 20px;
        }
        
        .complete-stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 40px;
        }
        
        .complete-actions {
            display: flex;
            gap: 20px;
            justify-content: center;
        }
        
        .btn-share, .btn-continue {
            padding: 12px 24px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-share {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .btn-continue {
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            color: white;
        }
        
        .achievement-unlock-modal .unlock-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        
        .unlock-icon.common { color: #4CAF50; }
        .unlock-icon.rare { color: #2196F3; }
        .unlock-icon.epic { color: #9C27B0; }
        .unlock-icon.legendary { color: #FFD700; }
        
        .unlock-shine {
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
            animation: achievementShine 1s ease-in-out;
        }
        
        .level-up-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        
        .level-up-content {
            text-align: center;
            color: white;
        }
        
        .level-up-glow {
            position: absolute;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.5) 0%, transparent 70%);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: levelGlow 2s ease-out;
        }
        
        @keyframes levelGlow {
            from { transform: translate(-50%, -50%) scale(0); }
            to { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        
        .level-up-number {
            font-size: 120px;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 20px;
        }
    `;
    
    document.head.appendChild(style);
}

// リワードエフェクトの準備
function prepareRewardEffects() {
    console.log('✨ リワードシステム準備完了');
}

// デバッグ情報
console.log('🎮 Gymmee App - Pattern 02 (Modern)');
console.log('🎨 バージョン: 1.0.0');
console.log('🚀 パターン: モダン - 最新トレンドとエンゲージメント重視');

// Debug helper function
window.debugNavigation = function() {
    console.log('=== Navigation Debug Info ===');
    console.log('Cached screens:', Object.keys(elements.screens));
    console.log('Cached nav items:', Object.keys(elements.navItems));
    
    // Check nav items
    document.querySelectorAll('.nav-item').forEach((item, index) => {
        console.log(`Nav item ${index}:`, {
            screen: item.dataset.screen,
            hasClickHandler: item.onclick !== null || item._listeners !== undefined,
            classList: item.className,
            isDisabled: item.disabled
        });
    });
    
    // Check screens
    document.querySelectorAll('.screen').forEach((screen) => {
        console.log(`Screen ${screen.id}:`, {
            isActive: screen.classList.contains('active'),
            display: window.getComputedStyle(screen).display
        });
    });
    
    // Check for overlapping elements
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const elementAtPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
        if (elementAtPoint !== item && !item.contains(elementAtPoint)) {
            console.warn(`Nav item ${index} might be blocked by:`, elementAtPoint);
        }
    });
    
    console.log('=== End Debug Info ===');
};

// ==========================================
// 新規画面機能（完全版デモ用）
// ==========================================

// エクスプロア画面の初期化
function initializeExploreScreen() {
    // タブ切り替え
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            // タブに応じてコンテンツを更新
            const tabType = e.target.textContent;
            updateExerciseLibrary(tabType);
        });
    });
    
    // プログラムカードクリック
    document.querySelectorAll('.program-card').forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.program-title').textContent;
            showNotification(`${title}を開始しました！`, 'success');
            
            // プログラムを開始
            startProgram(title);
        });
    });
    
    // エクササイズ検索
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterExercises(query);
        });
    }
}

// プロフィール画面の初期化
function initializeProfileScreen() {
    // 設定項目クリック
    document.querySelectorAll('.setting-item').forEach(item => {
        item.addEventListener('click', () => {
            const label = item.querySelector('.setting-label').textContent;
            
            switch(label) {
                case 'アカウント設定':
                    showAccountSettings();
                    break;
                case '通知設定':
                    showNotificationSettings();
                    break;
                case 'プライバシー':
                    showPrivacySettings();
                    break;
                case 'ヘルプ':
                    showHelp();
                    break;
                case 'フィードバック':
                    showFeedbackForm();
                    break;
                case 'ログアウト':
                    confirmLogout();
                    break;
                default:
                    showNotification(`${label}の設定を開きます`, 'info');
            }
        });
    });
    
    // プロフィール統計の更新
    updateProfileStats();
}

// AIコーチ画面の初期化
function initializeAICoachScreen() {
    const chatInput = document.querySelector('.chat-input');
    const sendBtn = document.querySelector('.send-btn');
    const messagesContainer = document.querySelector('.chat-messages');
    
    // メッセージ送信
    const sendMessage = () => {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // ユーザーメッセージを追加
        addMessage(message, 'user');
        chatInput.value = '';
        
        // タイピングインジケーターを表示
        showTypingIndicator();
        
        // AIの返答を生成（デモ用）
        setTimeout(() => {
            hideTypingIndicator();
            const aiResponse = generateAIResponse(message);
            addMessage(aiResponse, 'ai');
        }, 1500);
    };
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // クイックアクション
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            chatInput.value = btn.textContent;
            sendMessage();
        });
    });
    
    // 初期メッセージ
    if (messagesContainer && messagesContainer.children.length === 0) {
        addMessage('こんにちは！AIコーチのミカです。今日のトレーニングについて何かお手伝いできることはありますか？', 'ai');
    }
}

// 栄養管理画面の初期化
function initializeNutritionScreen() {
    // カロリーサークルの更新
    updateCalorieCircle();
    
    // マクロ栄養素の更新
    updateMacronutrients();
    
    // 食事追加ボタン
    const addMealBtn = document.querySelector('.add-meal-btn');
    if (addMealBtn) {
        addMealBtn.addEventListener('click', () => {
            showAddMealDialog();
        });
    }
    
    // 食事項目クリック
    document.querySelectorAll('.meal-item').forEach(item => {
        item.addEventListener('click', () => {
            const mealName = item.querySelector('.meal-name').textContent;
            showMealDetails(mealName);
        });
    });
}

// コミュニティ画面の初期化
function initializeCommunityScreen() {
    // タブ切り替え
    document.querySelectorAll('.community-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.community-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            const tabName = e.target.textContent;
            updateCommunityContent(tabName);
        });
    });
    
    // いいねボタン
    document.querySelectorAll('.post-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.textContent.includes('いいね')) {
                btn.classList.toggle('liked');
                const isLiked = btn.classList.contains('liked');
                btn.innerHTML = `<span>❤️</span> いいね${isLiked ? '!' : ''}`;
                
                if (isLiked) {
                    createHeartAnimation(e.clientX, e.clientY);
                }
            }
        });
    });
    
    // チャレンジカード
    document.querySelectorAll('.challenge-card').forEach(card => {
        card.addEventListener('click', () => {
            const challengeName = card.querySelector('.challenge-name').textContent;
            showChallengeDetails(challengeName);
        });
    });
}

// ========== ヘルパー関数 ==========

// エクササイズライブラリの更新
function updateExerciseLibrary(tabType) {
    console.log(`エクササイズライブラリを${tabType}で更新`);
    // デモ用：実際にはAPIからデータを取得
}

// エクササイズのフィルタリング
function filterExercises(query) {
    document.querySelectorAll('.exercise-item').forEach(item => {
        const name = item.querySelector('.exercise-name').textContent.toLowerCase();
        const muscles = item.querySelector('.exercise-muscles').textContent.toLowerCase();
        
        if (name.includes(query) || muscles.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// プログラム開始
function startProgram(programName) {
    AppState.currentProgram = programName;
    showScreen('workout');
}

// プロフィール統計の更新
function updateProfileStats() {
    // デモ用のアニメーション
    document.querySelectorAll('.profile-stat-value').forEach((stat, index) => {
        setTimeout(() => {
            stat.style.transform = 'scale(1.2)';
            setTimeout(() => {
                stat.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
}

// AIメッセージの追加
function addMessage(content, sender) {
    const messagesContainer = document.querySelector('.chat-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const time = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-bubble">${content}</div>
        <div class="message-time">${time}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// タイピングインジケーターの表示
function showTypingIndicator() {
    const messagesContainer = document.querySelector('.chat-messages');
    if (!messagesContainer) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
    `;
    
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// タイピングインジケーターの非表示
function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// AI応答の生成（デモ用）
function generateAIResponse(userMessage) {
    const responses = {
        'フォーム': 'スクワットのフォームについてですね！背筋を伸ばし、膝がつま先より前に出ないように注意しましょう。動画を見ながら練習してみてください。',
        '筋肉痛': '筋肉痛は成長の証です！軽いストレッチと十分な水分補給を心がけましょう。痛みが強い場合は無理せず休養を取ってくださいね。',
        '食事': 'トレーニング後30分以内にプロテインと炭水化物を摂取すると効果的です。今日の栄養バランスを確認してみましょうか？',
        default: 'いいご質問ですね！あなたの目標達成に向けて、最適なアドバイスを提供させていただきます。詳しく教えていただけますか？'
    };
    
    for (const key in responses) {
        if (userMessage.includes(key)) {
            return responses[key];
        }
    }
    
    return responses.default;
}

// カロリーサークルの更新
function updateCalorieCircle() {
    const circle = document.querySelector('.circle-progress');
    if (!circle) return;
    
    const consumed = 1847;
    const target = 2400;
    const percentage = (consumed / target) * 100;
    
    const radius = 88;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100 * circumference);
    
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${offset}`;
}

// マクロ栄養素の更新
function updateMacronutrients() {
    const macros = {
        protein: { current: 95, target: 120 },
        carbs: { current: 225, target: 300 },
        fat: { current: 65, target: 80 }
    };
    
    Object.keys(macros).forEach(macro => {
        const percentage = (macros[macro].current / macros[macro].target) * 100;
        const fill = document.querySelector(`.${macro}-fill`);
        if (fill) {
            fill.style.width = `${percentage}%`;
        }
    });
}

// コミュニティコンテンツの更新
function updateCommunityContent(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.style.display = 'none';
    });
    
    // タブに応じたコンテンツを表示
    switch(tabName) {
        case 'フィード':
            document.querySelector('.social-feed').style.display = 'flex';
            break;
        case 'チャレンジ':
            document.querySelector('.challenges-grid').style.display = 'grid';
            break;
        case 'ランキング':
            document.querySelector('.leaderboard').style.display = 'block';
            break;
    }
}

// ハートアニメーション
function createHeartAnimation(x, y) {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        font-size: 24px;
        pointer-events: none;
        animation: floatHeart 1s ease-out forwards;
        z-index: 9999;
    `;
    
    document.body.appendChild(heart);
    
    setTimeout(() => heart.remove(), 1000);
}

// CSSアニメーションの追加
const heartStyle = document.createElement('style');
heartStyle.textContent = `
    @keyframes floatHeart {
        to {
            transform: translateY(-100px) scale(1.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(heartStyle);

// ダイアログ表示関数（デモ用）
function showAddMealDialog() {
    showNotification('食事追加機能は準備中です', 'info');
}

function showMealDetails(mealName) {
    showNotification(`${mealName}の詳細を表示`, 'info');
}

function showChallengeDetails(challengeName) {
    showNotification(`${challengeName}に参加しました！`, 'success');
}

function showAccountSettings() {
    showNotification('アカウント設定画面', 'info');
}

function showNotificationSettings() {
    showNotification('通知設定画面', 'info');
}

function showPrivacySettings() {
    showNotification('プライバシー設定画面', 'info');
}

// Profile menu click handler
function handleProfileMenuClick(e) {
    const menuItem = e.currentTarget;
    const menuText = menuItem.querySelector('span').textContent;
    
    // Map menu items to screen IDs
    const screenMap = {
        'プロフィール編集': 'profile-edit-screen',
        '目標設定': 'goal-settings-screen',
        'アプリ設定': 'app-settings-screen',
        '通知設定': 'notification-settings-screen',
        'プライバシー': 'privacy-settings-screen',
        'プレミアムプラン': 'premium-plan-screen',
        'ヘルプ＆サポート': 'help-support-screen'
    };
    
    const targetScreenId = screenMap[menuText];
    
    if (targetScreenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(targetScreenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            targetScreen.scrollTop = 0;
            
            // Update app state
            AppState.currentScreen = targetScreenId.replace('-screen', '');
            
            // Initialize screen if needed
            initializeScreen(targetScreenId);
        }
    } else if (menuText === 'ログアウト') {
        confirmLogout();
    }
}

// Initialize specific screens
function initializeScreen(screenId) {
    switch(screenId) {
        case 'goal-settings-screen':
            initializeGoalSettings();
            break;
        case 'notification-settings-screen':
            initializeNotificationSettings();
            break;
        case 'help-support-screen':
            initializeHelpSupport();
            break;
    }
}

// Initialize goal settings screen
function initializeGoalSettings() {
    const slider = document.querySelector('.commitment-slider-input');
    const valueDisplay = document.querySelector('.commitment-value');
    
    if (slider && valueDisplay) {
        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = e.target.value;
        });
    }
}

// Initialize notification settings
function initializeNotificationSettings() {
    // Initialize notification toggles
    const notificationToggles = document.querySelectorAll('.notification-item input[type="checkbox"]');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const saveSettingsBtn = document.querySelector('.btn-save-notification-settings');
    
    // Load saved preferences
    loadNotificationPreferences();
    
    // Update notification count on load
    updateNotificationCount();
    
    // Add event listeners to toggles
    notificationToggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            updateNotificationCount();
            updatePresetSelection();
        });
    });
    
    // Preset button handlers
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            applyPreset(preset);
        });
    });
    
    // Save settings button
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveNotificationSettings);
    }
    
    // Expandable notification items
    const expandButtons = document.querySelectorAll('.expand-btn');
    expandButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.notification-item');
            const details = item.querySelector('.notification-details');
            
            if (item.classList.contains('expanded')) {
                item.classList.remove('expanded');
                details.style.maxHeight = '0';
            } else {
                // Close other expanded items
                document.querySelectorAll('.notification-item.expanded').forEach(expandedItem => {
                    expandedItem.classList.remove('expanded');
                    expandedItem.querySelector('.notification-details').style.maxHeight = '0';
                });
                
                item.classList.add('expanded');
                details.style.maxHeight = details.scrollHeight + 'px';
            }
        });
    });
    
    // Preview buttons
    const previewButtons = document.querySelectorAll('.preview-btn');
    previewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = btn.closest('.notification-item');
            const label = item.querySelector('.notification-label').textContent;
            previewNotification(label);
        });
    });
    
    // Silent period management
    const addSilentPeriodBtn = document.querySelector('.add-silent-period');
    if (addSilentPeriodBtn) {
        addSilentPeriodBtn.addEventListener('click', addSilentPeriod);
    }
    
    // Holiday mode toggle
    const holidayModeToggle = document.querySelector('input[name="holiday-mode"]');
    if (holidayModeToggle) {
        holidayModeToggle.addEventListener('change', updateHolidayMode);
    }
}

// Apply notification preset
function applyPreset(preset) {
    const toggles = document.querySelectorAll('.notification-item input[type="checkbox"]');
    
    switch(preset) {
        case 'all-on':
            toggles.forEach(toggle => toggle.checked = true);
            break;
        case 'all-off':
            toggles.forEach(toggle => toggle.checked = false);
            break;
        case 'essential':
            toggles.forEach(toggle => {
                const item = toggle.closest('.notification-item');
                const priority = item.dataset.priority;
                toggle.checked = priority === 'high';
            });
            break;
        case 'custom':
            // Do nothing, user will customize
            break;
    }
    
    updateNotificationCount();
    updatePresetSelection();
}

// Update preset button selection
function updatePresetSelection() {
    const toggles = document.querySelectorAll('.notification-item input[type="checkbox"]');
    const checkedCount = document.querySelectorAll('.notification-item input[type="checkbox"]:checked').length;
    const totalCount = toggles.length;
    const highPriorityChecked = document.querySelectorAll('.notification-item[data-priority="high"] input[type="checkbox"]:checked').length;
    const highPriorityTotal = document.querySelectorAll('.notification-item[data-priority="high"]').length;
    
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => btn.classList.remove('active'));
    
    if (checkedCount === totalCount) {
        document.querySelector('.preset-btn[data-preset="all-on"]')?.classList.add('active');
    } else if (checkedCount === 0) {
        document.querySelector('.preset-btn[data-preset="all-off"]')?.classList.add('active');
    } else if (highPriorityChecked === highPriorityTotal && checkedCount === highPriorityTotal) {
        document.querySelector('.preset-btn[data-preset="essential"]')?.classList.add('active');
    } else {
        document.querySelector('.preset-btn[data-preset="custom"]')?.classList.add('active');
    }
}

// Update notification count
function updateNotificationCount() {
    const checkedCount = document.querySelectorAll('.notification-item input[type="checkbox"]:checked').length;
    const countDisplay = document.querySelector('.notification-count');
    
    if (countDisplay) {
        // Estimate daily notifications based on enabled types
        let estimatedDaily = 0;
        document.querySelectorAll('.notification-item input[type="checkbox"]:checked').forEach(toggle => {
            const item = toggle.closest('.notification-item');
            const label = item.querySelector('.notification-label').textContent;
            
            // Rough estimates based on notification type
            if (label.includes('リマインダー')) estimatedDaily += 3;
            else if (label.includes('レポート')) estimatedDaily += 0.2;
            else if (label.includes('分析')) estimatedDaily += 0.1;
            else if (label.includes('水分補給')) estimatedDaily += 8;
            else estimatedDaily += 1;
        });
        
        countDisplay.innerHTML = `
            <div class="count-summary">
                <span class="count-active">${checkedCount} 個の通知が有効</span>
                <span class="count-estimate">推定: 約 ${Math.round(estimatedDaily)} 件/日</span>
            </div>
        `;
    }
}

// Preview notification
function previewNotification(type) {
    const preview = document.createElement('div');
    preview.className = 'notification-preview';
    preview.innerHTML = `
        <div class="preview-header">
            <img src="https://via.placeholder.com/40" alt="App Icon" class="preview-icon">
            <div class="preview-app">Gymmee</div>
            <div class="preview-time">今</div>
        </div>
        <div class="preview-title">${type}</div>
        <div class="preview-body">${getPreviewMessage(type)}</div>
        <div class="preview-actions">
            <button class="preview-action">開く</button>
            <button class="preview-action">後で</button>
        </div>
    `;
    
    document.body.appendChild(preview);
    
    // Play notification sound if enabled
    const item = Array.from(document.querySelectorAll('.notification-label')).find(
        label => label.textContent === type
    )?.closest('.notification-item');
    
    if (item) {
        const soundSelect = item.querySelector('.notification-sound');
        const vibrationToggle = item.querySelector('input[name*="vibration"]');
        
        if (soundSelect && soundSelect.value !== 'none') {
            // Play sound (simulated)
            console.log(`Playing sound: ${soundSelect.value}`);
        }
        
        if (vibrationToggle && vibrationToggle.checked && 'vibrate' in navigator) {
            navigator.vibrate(200);
        }
    }
    
    setTimeout(() => {
        preview.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        preview.classList.remove('show');
        setTimeout(() => preview.remove(), 300);
    }, 3000);
}

// Get preview message based on notification type
function getPreviewMessage(type) {
    const messages = {
        'ワークアウトリマインダー': '18:00からの胸部トレーニングの時間です！準備はいいですか？',
        'セット間リマインダー': '休憩時間終了！次のセットを始めましょう',
        '休息日の通知': '今日は休息日です。しっかり体を休めて明日に備えましょう',
        '週間レポート': '今週は5回のワークアウトを完了！先週比で120%の成長です🎉',
        '月間分析': '今月の詳細な分析レポートが準備できました',
        'アチーブメント': '新記録達成！ベンチプレス100kg達成おめでとうございます！🏆',
        'フレンドリクエスト': '田中太郎さんがフレンドリクエストを送信しました',
        'チャレンジ招待': '山田花子さんが「30日間スクワットチャレンジ」に招待しました',
        '食事記録リマインダー': '昼食の記録を忘れていませんか？',
        '水分補給リマインダー': '水分補給の時間です。コップ一杯の水を飲みましょう',
        'AIコーチの提案': '今日のパフォーマンスを基に、明日のメニューを最適化しました',
        'トレーニングのヒント': '今日のヒント：デッドリフトでは背中を真っ直ぐに保ちましょう',
        '今日の名言': '「限界は、それを受け入れるまで存在しない」- マイケル・ジョーダン',
        '週間チャレンジ': '今週のチャレンジ：腕立て伏せ500回を達成しよう！',
        'ログインアラート': '新しいデバイスからログインがありました（iPhone 13, 東京）',
        'パスワード変更': 'パスワードが正常に変更されました',
        'アップデート通知': 'Gymmee v2.5が利用可能です。新機能をチェック！',
        'メンテナンス予告': '明日2:00-4:00にメンテナンスを実施します'
    };
    
    return messages[type] || 'Gymmeeからの通知です';
}

// Add silent period
function addSilentPeriod() {
    const container = document.querySelector('.silent-periods');
    const newPeriod = document.createElement('div');
    newPeriod.className = 'silent-period-item';
    newPeriod.innerHTML = `
        <input type="time" class="time-input" value="22:00">
        <span>〜</span>
        <input type="time" class="time-input" value="07:00">
        <button class="remove-period" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.insertBefore(newPeriod, container.querySelector('.add-silent-period'));
}

// Update holiday mode
function updateHolidayMode() {
    const isEnabled = this.checked;
    if (isEnabled) {
        showNotification('休日モードが有効になりました', 'success');
    } else {
        showNotification('休日モードが無効になりました', 'info');
    }
}

// Save notification settings
function saveNotificationSettings() {
    const preferences = {
        notifications: {},
        schedule: {},
        silentPeriods: []
    };
    
    // Save notification toggles
    document.querySelectorAll('.notification-item input[type="checkbox"]').forEach(toggle => {
        const label = toggle.closest('.notification-item').querySelector('.notification-label').textContent;
        preferences.notifications[label] = toggle.checked;
    });
    
    // Save schedule
    document.querySelectorAll('.day-schedule').forEach(schedule => {
        const day = schedule.querySelector('.day-label').textContent;
        const enabled = schedule.querySelector('input[type="checkbox"]').checked;
        const startTime = schedule.querySelector('.day-start-time').value;
        const endTime = schedule.querySelector('.day-end-time').value;
        
        preferences.schedule[day] = { enabled, startTime, endTime };
    });
    
    // Save silent periods
    document.querySelectorAll('.silent-period-item').forEach(period => {
        const times = period.querySelectorAll('.time-input');
        if (times.length === 2) {
            preferences.silentPeriods.push({
                start: times[0].value,
                end: times[1].value
            });
        }
    });
    
    // Save holiday mode
    preferences.holidayMode = document.querySelector('input[name="holiday-mode"]')?.checked || false;
    
    // Save to localStorage
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    
    // Show confirmation
    showNotification('通知設定を保存しました', 'success');
    
    // Animate save button
    const saveBtn = document.querySelector('.btn-save-notification-settings');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-check"></i> 保存完了';
        setTimeout(() => {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> 設定を保存';
        }, 2000);
    }
}

// Load notification preferences
function loadNotificationPreferences() {
    const savedPreferences = JSON.parse(localStorage.getItem('notificationPreferences') || '{}');
    
    // Apply notification toggles
    if (savedPreferences.notifications) {
        Object.entries(savedPreferences.notifications).forEach(([label, enabled]) => {
            const toggle = Array.from(document.querySelectorAll('.notification-label'))
                .find(el => el.textContent === label)
                ?.closest('.notification-item')
                ?.querySelector('input[type="checkbox"]');
            
            if (toggle) {
                toggle.checked = enabled;
            }
        });
    }
    
    // Apply schedule
    if (savedPreferences.schedule) {
        Object.entries(savedPreferences.schedule).forEach(([day, settings]) => {
            const schedule = Array.from(document.querySelectorAll('.day-label'))
                .find(el => el.textContent === day)
                ?.closest('.day-schedule');
            
            if (schedule) {
                schedule.querySelector('input[type="checkbox"]').checked = settings.enabled;
                schedule.querySelector('.day-start-time').value = settings.startTime;
                schedule.querySelector('.day-end-time').value = settings.endTime;
            }
        });
    }
    
    // Apply silent periods
    if (savedPreferences.silentPeriods && savedPreferences.silentPeriods.length > 0) {
        const container = document.querySelector('.silent-periods');
        
        // Remove default period if custom ones exist
        const defaultPeriod = container.querySelector('.silent-period-item');
        if (defaultPeriod) defaultPeriod.remove();
        
        savedPreferences.silentPeriods.forEach(period => {
            const newPeriod = document.createElement('div');
            newPeriod.className = 'silent-period-item';
            newPeriod.innerHTML = `
                <input type="time" class="time-input" value="${period.start}">
                <span>〜</span>
                <input type="time" class="time-input" value="${period.end}">
                <button class="remove-period" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.insertBefore(newPeriod, container.querySelector('.add-silent-period'));
        });
    }
    
    // Apply holiday mode
    if (savedPreferences.holidayMode !== undefined) {
        const holidayToggle = document.querySelector('input[name="holiday-mode"]');
        if (holidayToggle) {
            holidayToggle.checked = savedPreferences.holidayMode;
        }
    }
}

// Initialize help & support screen
function initializeHelpSupport() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                // Close other FAQs
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current FAQ
                item.classList.toggle('active');
            });
        }
    });
}

function showHelp() {
    showNotification('ヘルプセンターを開きます', 'info');
}

function showFeedbackForm() {
    showNotification('フィードバックフォームを開きます', 'info');
}

function confirmLogout() {
    if (confirm('ログアウトしますか？')) {
        showNotification('ログアウトしました', 'success');
        // 実際のログアウト処理
    }
}

// 画面表示関数の更新
const originalShowScreen = showScreen;
showScreen = function(screenName) {
    originalShowScreen(screenName);
    
    // 新規画面の初期化
    switch(screenName) {
        case 'explore':
            initializeExploreScreen();
            break;
        case 'profile':
            initializeProfileScreen();
            break;
        case 'ai-coach':
            initializeAICoachScreen();
            break;
        case 'nutrition':
            initializeNutritionScreen();
            break;
        case 'community':
            initializeCommunityScreen();
            break;
    }
};

// Supplement Management Functions
function initializeSupplementManagement() {
    // Handle supplement checkboxes
    const supplementCheckboxes = document.querySelectorAll('.supplement-checkbox input[type="checkbox"]');
    supplementCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const supplementItem = this.closest('.supplement-item');
            const statusElement = supplementItem.querySelector('.supplement-status');
            
            if (this.checked) {
                // Mark as taken
                supplementItem.classList.remove('upcoming');
                statusElement.classList.add('taken');
                statusElement.innerHTML = '<i class="fas fa-check"></i>';
                
                // Show notification
                const supplementName = supplementItem.querySelector('.supplement-info h5').textContent;
                showNotification(`${supplementName}を摂取しました`, 'success');
                
                // Update progress
                updateSupplementProgress();
            } else {
                // Unmark
                const timeRemaining = statusElement.dataset.timeRemaining || '未定';
                statusElement.classList.remove('taken');
                statusElement.innerHTML = `<span class="time-remaining">${timeRemaining}</span>`;
                
                updateSupplementProgress();
            }
        });
    });
    
    // Add supplement button
    const addSupplementBtn = document.querySelector('.btn-add-supplement');
    if (addSupplementBtn) {
        addSupplementBtn.addEventListener('click', function() {
            showAddSupplementModal();
        });
    }
    
    // Store original time remaining values
    document.querySelectorAll('.supplement-status .time-remaining').forEach(element => {
        element.parentElement.dataset.timeRemaining = element.textContent;
    });
}

// Update supplement progress
function updateSupplementProgress() {
    const totalSupplements = document.querySelectorAll('.supplement-checkbox input[type="checkbox"]').length;
    const takenSupplements = document.querySelectorAll('.supplement-checkbox input[type="checkbox"]:checked').length;
    const percentage = Math.round((takenSupplements / totalSupplements) * 100);
    
    // Update goal progress if exists
    const goalPercentage = document.querySelector('.supplement-goals .goal-percentage');
    if (goalPercentage) {
        goalPercentage.textContent = `${percentage}%`;
        const goalFill = document.querySelector('.supplement-goals .goal-fill');
        if (goalFill) {
            goalFill.style.width = `${percentage}%`;
        }
    }
}

// Show add supplement modal
function showAddSupplementModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content glass-card">
            <div class="modal-header">
                <h3>サプリメントを追加</h3>
                <button class="modal-close" onclick="closeModal(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="add-supplement-form">
                    <div class="form-group">
                        <label>サプリメント名</label>
                        <input type="text" class="form-input" placeholder="例: ホエイプロテイン" required>
                    </div>
                    <div class="form-group">
                        <label>種類</label>
                        <select class="form-select">
                            <option value="protein">プロテイン</option>
                            <option value="vitamin">ビタミン</option>
                            <option value="mineral">ミネラル</option>
                            <option value="other">その他</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>摂取タイミング</label>
                        <select class="form-select">
                            <option value="morning">朝食時</option>
                            <option value="pre-workout">トレーニング前</option>
                            <option value="post-workout">トレーニング後</option>
                            <option value="night">就寝前</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>用量</label>
                        <input type="text" class="form-input" placeholder="例: 1錠、30g" required>
                    </div>
                    <button type="submit" class="btn-primary">追加</button>
                </form>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    modal.querySelector('#add-supplement-form').addEventListener('submit', function(e) {
        e.preventDefault();
        showNotification('サプリメントを追加しました', 'success');
        closeModal(modal.querySelector('.modal-close'));
    });
}

// Close modal helper
function closeModal(closeBtn) {
    const modal = closeBtn.closest('.modal-overlay');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => modal.remove(), 300);
    }
}

// Initialize supplement management when nutrition screen is shown
function initializeNutritionScreen() {
    initializeSupplementManagement();
}

// Workout execution controls
document.addEventListener('click', function(e) {
    // Back button - only handle if it's not a navigation back button with data-screen
    const backBtn = e.target.closest('.btn-back');
    if (backBtn && !backBtn.hasAttribute('data-screen')) {
        // Check if we're in workout execution mode
        const executionMode = document.querySelector('.workout-execution-mode');
        if (executionMode && executionMode.style.display !== 'none') {
            e.preventDefault(); // 追加: デフォルト動作を防止
            e.stopPropagation(); // 追加: イベントの伝播を停止
            
            // Hide execution mode, show selection mode
            const selectionMode = document.querySelector('.workout-selection-mode');
            if (selectionMode) selectionMode.style.display = 'block';
            if (executionMode) executionMode.style.display = 'none';
            
            // Reset workout state
            AppState.workout.inProgress = false;
            
            // Show notification
            showNotification('ワークアウトを中断しました', 'info');
        }
    }
    
    // Pause button
    if (e.target.closest('.btn-pause')) {
        const pauseBtn = e.target.closest('.btn-pause');
        const isPaused = pauseBtn.classList.contains('paused');
        
        if (isPaused) {
            pauseBtn.classList.remove('paused');
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            showNotification('ワークアウトを再開しました', 'success');
        } else {
            pauseBtn.classList.add('paused');
            pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            showNotification('ワークアウトを一時停止しました', 'info');
        }
    }
    
    // Start set button
    if (e.target.closest('.btn-start-set')) {
        document.getElementById('set-ready').style.display = 'none';
        document.getElementById('set-active').style.display = 'block';
        showNotification('セット開始！頑張って！', 'success');
    }
    
    // Complete set button
    if (e.target.closest('.btn-complete-set')) {
        document.getElementById('set-active').style.display = 'none';
        document.getElementById('rest-timer').style.display = 'block';
        showNotification('セット完了！よく頑張りました！', 'success');
        startRestTimer();
    }
    
    // Rep counter controls
    if (e.target.closest('.rep-control')) {
        const control = e.target.closest('.rep-control');
        const countNumber = document.querySelector('.count-number');
        let count = parseInt(countNumber.textContent);
        
        if (control.classList.contains('plus')) {
            count++;
        } else if (control.classList.contains('minus') && count > 0) {
            count--;
        }
        
        countNumber.textContent = count;
    }
    
    // Skip rest button
    if (e.target.closest('.btn-skip-rest')) {
        document.getElementById('rest-timer').style.display = 'none';
        document.getElementById('set-ready').style.display = 'block';
        showNotification('次のセットの準備をしてください', 'info');
    }
});

// Rest timer function
function startRestTimer() {
    let seconds = 90;
    const timerValue = document.querySelector('.timer-value');
    const timerProgress = document.querySelector('.timer-progress');
    
    const interval = setInterval(() => {
        seconds--;
        timerValue.textContent = seconds;
        
        // Update progress circle
        const offset = 339.3 - (339.3 * (seconds / 90));
        timerProgress.style.strokeDashoffset = offset;
        
        if (seconds <= 0) {
            clearInterval(interval);
            document.getElementById('rest-timer').style.display = 'none';
            document.getElementById('set-ready').style.display = 'block';
            showNotification('休憩終了！次のセットの準備をしてください', 'info');
        }
    }, 1000);
}

// AI Chat functionality
document.addEventListener('DOMContentLoaded', function() {
    const aiFab = document.getElementById('ai-fab');
    const aiChatOverlay = document.getElementById('ai-chat-overlay');
    const aiChatClose = document.getElementById('ai-chat-close');
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiChatSend = document.getElementById('ai-chat-send');
    const aiChatMessages = document.getElementById('ai-chat-messages');
    
    console.log('AI Chat initialized:', { aiFab, aiChatOverlay }); // デバッグ用
    
    // Open AI chat
    if (aiFab) {
        aiFab.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('FAB clicked!'); // デバッグ用
            
            if (aiChatOverlay) {
                aiChatOverlay.style.display = 'flex';
                // アニメーションのためにタイムアウトを使用
                setTimeout(() => {
                    aiChatOverlay.classList.add('active');
                    if (aiChatInput) aiChatInput.focus();
                }, 10);
            } else {
                console.error('AI Chat Overlay not found!');
            }
            
            // Get context about current screen
            const currentScreen = document.querySelector('.screen.active');
            if (currentScreen) {
                const screenId = currentScreen.id;
                addContextMessage(screenId);
            }
        });
    }
    
    // Close AI chat
    if (aiChatClose) {
        aiChatClose.addEventListener('click', function() {
            aiChatOverlay.classList.remove('active');
            // アニメーション完了後に非表示
            setTimeout(() => {
                aiChatOverlay.style.display = 'none';
            }, 300);
        });
    }
    
    // Close when clicking outside
    if (aiChatOverlay) {
        aiChatOverlay.addEventListener('click', function(e) {
            if (e.target === aiChatOverlay) {
                aiChatOverlay.classList.remove('active');
                // アニメーション完了後に非表示
                setTimeout(() => {
                    aiChatOverlay.style.display = 'none';
                }, 300);
            }
        });
    }
    
    // Send message
    function sendMessage() {
        const message = aiChatInput.value.trim();
        if (message) {
            // Add user message
            addUserMessage(message);
            aiChatInput.value = '';
            
            // Simulate AI response
            setTimeout(() => {
                const response = generateAIResponse(message);
                addAIMessage(response);
            }, 1000);
        }
    }
    
    if (aiChatSend) {
        aiChatSend.addEventListener('click', sendMessage);
    }
    
    if (aiChatInput) {
        aiChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Add user message to chat
    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        aiChatMessages.appendChild(messageDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }
    
    // Add AI message to chat
    function addAIMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        aiChatMessages.appendChild(messageDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }
    
    // Add context message based on current screen
    function addContextMessage(screenId) {
        const contextMessages = {
            'home-screen': '現在ホーム画面を見ていますね。成長状況やトレーニング実績について何か質問はありますか？',
            'workout-screen': 'ワークアウト画面ですね。今日のトレーニングプランについてアドバイスしましょうか？',
            'nutrition-screen': '栄養管理画面を見ていますね。栄養バランスやサプリメントについて相談できますよ。',
            'explore-screen': '新しいプログラムを探していますか？あなたに合ったプログラムを提案できます。',
            'profile-screen': 'プロフィール画面ですね。目標設定や進捗について話しましょうか？'
        };
        
        const message = contextMessages[screenId] || 'どのようなサポートが必要ですか？';
        setTimeout(() => addAIMessage(message), 500);
    }
    
    // Generate AI response (simplified)
    function generateAIResponse(userMessage) {
        const responses = {
            '筋肉': '筋肉を効率的に増やすには、適切な負荷と栄養、そして休息が重要です。週3-4回のトレーニングがおすすめです。',
            'プロテイン': 'プロテインは体重1kgあたり1.6-2.2gが理想的です。トレーニング後30分以内の摂取が効果的ですよ。',
            '痩せ': '減量には有酸素運動と筋トレの組み合わせが効果的です。カロリー収支をマイナスに保ちながら、筋肉量を維持することが大切です。',
            'フォーム': '正しいフォームは怪我の予防と効果的なトレーニングの基本です。鏡を使ったり、動画を撮って確認するのがおすすめです。'
        };
        
        // Check for keywords
        for (const [keyword, response] of Object.entries(responses)) {
            if (userMessage.includes(keyword)) {
                return response;
            }
        }
        
        // Default response
        return 'なるほど、それについてもっと詳しく教えていただけますか？あなたの目標に合わせたアドバイスをさせていただきます。';
    }
});

// ===== Workout Options Handling =====

// Initialize workout options when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    handleWorkoutOptions();
});

// ワークアウトオプションボタンのハンドラー
function handleWorkoutOptions() {
    // 新しいワークアウトオプションボタンのイベントリスナーを追加
    document.querySelectorAll('.workout-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            
            switch(action) {
                case 'start-full':
                    startFullWorkout();
                    break;
                case 'select-exercises':
                    enableExerciseSelection();
                    break;
                case 'record-only':
                    startRecordOnlyMode();
                    break;
                case 'customize':
                    showCustomizeModal();
                    break;
                default:
                    console.log(`Unknown workout action: ${action}`);
            }
        });
    });
}

// 全体のワークアウトを開始
function startFullWorkout() {
    console.log('🏋️ 全体のワークアウトを開始');
    
    // Hide selection mode, show execution mode
    const selectionMode = document.querySelector('.workout-selection-mode');
    const executionMode = document.querySelector('.workout-execution-mode');
    
    if (selectionMode) selectionMode.style.display = 'none';
    if (executionMode) executionMode.style.display = 'block';
    
    // Start workout with all exercises
    showNotification('全体のワークアウトを開始します！', 'success');
}

// エクササイズ選択モードを有効化
function enableExerciseSelection() {
    console.log('✅ エクササイズ選択モードを有効化');
    
    const exerciseList = document.querySelector('.exercise-list');
    const selectionActions = document.querySelector('.exercise-selection-actions');
    const workoutOptions = document.querySelector('.workout-options');
    
    // エクササイズリストを選択モードに変更
    exerciseList.classList.add('select-mode');
    
    // ワークアウトオプションを非表示
    workoutOptions.style.display = 'none';
    
    // 選択アクションを表示
    selectionActions.classList.add('active');
    
    // キャンセルボタンのハンドラー
    const cancelBtn = document.querySelector('.btn-cancel-selection');
    cancelBtn.addEventListener('click', () => {
        disableExerciseSelection();
    });
    
    // 選択した種目を開始ボタンのハンドラー
    const startSelectedBtn = document.querySelector('.btn-start-selected');
    startSelectedBtn.addEventListener('click', () => {
        startSelectedExercises();
    });
    
    // チェックボックスの変更を監視
    document.querySelectorAll('.exercise-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectionCount);
    });
    
    // 初期の選択数を更新
    updateSelectionCount();
}

// エクササイズ選択モードを無効化
function disableExerciseSelection() {
    const exerciseList = document.querySelector('.exercise-list');
    const selectionActions = document.querySelector('.exercise-selection-actions');
    const workoutOptions = document.querySelector('.workout-options');
    
    // 選択モードを解除
    exerciseList.classList.remove('select-mode');
    
    // ワークアウトオプションを表示
    workoutOptions.style.display = 'grid';
    
    // 選択アクションを非表示
    selectionActions.classList.remove('active');
    
    // すべてのチェックボックスをリセット
    document.querySelectorAll('.exercise-checkbox').forEach(checkbox => {
        checkbox.checked = true;
    });
}

// 選択数を更新
function updateSelectionCount() {
    const checkedBoxes = document.querySelectorAll('.exercise-checkbox:checked');
    const startSelectedBtn = document.querySelector('.btn-start-selected');
    
    if (checkedBoxes.length > 0) {
        startSelectedBtn.innerHTML = `<i class="fas fa-play"></i> 選択した種目を開始 (${checkedBoxes.length})`;
        startSelectedBtn.disabled = false;
    } else {
        startSelectedBtn.innerHTML = '<i class="fas fa-play"></i> 選択した種目を開始';
        startSelectedBtn.disabled = true;
    }
}

// 選択したエクササイズを開始
function startSelectedExercises() {
    const selectedExercises = [];
    document.querySelectorAll('.exercise-checkbox:checked').forEach(checkbox => {
        const exerciseItem = checkbox.closest('.exercise-item');
        const exerciseName = exerciseItem.querySelector('.exercise-name').textContent;
        selectedExercises.push(exerciseName);
    });
    
    console.log('選択されたエクササイズ:', selectedExercises);
    
    // 選択モードを解除
    disableExerciseSelection();
    
    // Hide selection mode, show execution mode
    const selectionMode = document.querySelector('.workout-selection-mode');
    const executionMode = document.querySelector('.workout-execution-mode');
    
    if (selectionMode) selectionMode.style.display = 'none';
    if (executionMode) executionMode.style.display = 'block';
    
    // 選択したエクササイズでワークアウトを開始
    showNotification(`${selectedExercises.length}個のエクササイズを開始します！`, 'success');
}

// 記録のみモードを開始
function startRecordOnlyMode() {
    console.log('📝 記録のみモードを開始');
    showNotification('記録モードで開始しました', 'info');
    
    // Hide selection mode, show execution mode with record-only flag
    const selectionMode = document.querySelector('.workout-selection-mode');
    const executionMode = document.querySelector('.workout-execution-mode');
    
    if (selectionMode) selectionMode.style.display = 'none';
    if (executionMode) {
        executionMode.style.display = 'block';
        executionMode.classList.add('record-only-mode');
    }
    
    // ガイドメッセージを変更
    const readyMessage = document.querySelector('.ready-message p');
    if (readyMessage) {
        readyMessage.textContent = '記録モード：自由にトレーニングを記録してください';
    }
}

// カスタマイズモーダルを表示
function showCustomizeModal() {
    console.log('⚙️ カスタマイズモーダルを表示');
    
    // Create customize modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>ワークアウトをカスタマイズ</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="customize-section">
                    <h4>バーベルスクワット</h4>
                    <div class="customize-controls">
                        <div class="control-group">
                            <label>セット数</label>
                            <input type="number" value="4" min="1" max="10" class="control-input">
                        </div>
                        <div class="control-group">
                            <label>回数</label>
                            <input type="text" value="8-10" class="control-input">
                        </div>
                        <div class="control-group">
                            <label>重量 (kg)</label>
                            <input type="number" value="80" min="0" step="2.5" class="control-input">
                        </div>
                    </div>
                </div>
                <div class="customize-info">
                    <i class="fas fa-info-circle"></i>
                    <p>各エクササイズのセット数、回数、重量を調整できます</p>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    キャンセル
                </button>
                <button class="btn btn-primary" onclick="applyCustomization()">
                    適用して開始
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// カスタマイズを適用
function applyCustomization() {
    console.log('カスタマイズを適用');
    
    // Close modal
    document.querySelector('.modal-overlay').remove();
    
    // Start workout with customized settings
    startFullWorkout();
    showNotification('カスタマイズした設定でワークアウトを開始します', 'success');
}

// ===== Training Environment Settings Functions =====
function initTrainingEnvironmentSettings() {
    // Location option selection
    const locationOptions = document.querySelectorAll('.location-option');
    locationOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            locationOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked option
            this.classList.add('active');
            // Check the radio button
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });
    
    // Equipment selection
    const equipmentItems = document.querySelectorAll('.equipment-item');
    equipmentItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
    
    // Save settings button
    const saveBtn = document.querySelector('.save-settings-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveTrainingEnvironmentSettings();
        });
    }
}

function saveTrainingEnvironmentSettings() {
    // Collect all settings
    const settings = {
        location: document.querySelector('.location-option input:checked')?.value,
        equipment: Array.from(document.querySelectorAll('.equipment-item.selected')).map(item => 
            item.querySelector('span').textContent
        ),
        preferredTime: document.getElementById('preferred-time')?.value,
        maxDuration: document.getElementById('max-duration')?.value,
        gymName: document.getElementById('gym-name')?.value,
        gymAddress: document.getElementById('gym-address')?.value,
        gymPhone: document.getElementById('gym-phone')?.value,
        gymNotes: document.getElementById('gym-notes')?.value
    };
    
    // Save to localStorage
    localStorage.setItem('trainingEnvironmentSettings', JSON.stringify(settings));
    
    showNotification('設定を保存しました', '', 'success');
}

// ===== Subscription Management Functions =====
function initSubscriptionManagement() {
    // Plan selection
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        card.addEventListener('click', function() {
            if (!this.classList.contains('current')) {
                // Show upgrade confirmation
                showUpgradeConfirmation(this);
            }
        });
    });
    
    // Action buttons
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.textContent.trim();
            
            if (action.includes('支払い方法')) {
                showPaymentMethodModal();
            } else if (action.includes('履歴')) {
                // Payment history is already visible
            } else if (action.includes('キャンセル')) {
                showCancelConfirmation();
            }
        });
    });
}

function showUpgradeConfirmation(planCard) {
    const planName = planCard.querySelector('h3').textContent;
    const planPrice = planCard.querySelector('.amount').textContent;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>プランのアップグレード</h3>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>${planName}（${planPrice}/月）にアップグレードしますか？</p>
                <p class="text-sm text-gray-400">次回の請求日から新しいプランが適用されます。</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    キャンセル
                </button>
                <button class="btn btn-primary" onclick="upgradePlan('${planName}')">
                    アップグレード
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function upgradePlan(planName) {
    // Remove modal
    document.querySelector('.modal-overlay').remove();
    
    // Update UI to reflect new plan
    showNotification(`${planName}にアップグレードしました`, '次回の請求日から適用されます', 'success');
}

function showPaymentMethodModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>支払い方法の変更</h3>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form class="payment-form">
                    <div class="form-group">
                        <label>カード番号</label>
                        <input type="text" placeholder="1234 5678 9012 3456" class="form-input">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>有効期限</label>
                            <input type="text" placeholder="MM/YY" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>CVV</label>
                            <input type="text" placeholder="123" class="form-input">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>カード名義人</label>
                        <input type="text" placeholder="TARO YAMADA" class="form-input">
                    </div>
                </form>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    キャンセル
                </button>
                <button class="btn btn-primary" onclick="updatePaymentMethod()">
                    更新
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function updatePaymentMethod() {
    document.querySelector('.modal-overlay').remove();
    showNotification('支払い方法を更新しました', '', 'success');
}

function showCancelConfirmation() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>サブスクリプションのキャンセル</h3>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>本当にサブスクリプションをキャンセルしますか？</p>
                <p class="text-sm text-gray-400">現在の請求期間の終了まで、すべての機能を引き続きご利用いただけます。</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    キャンセルしない
                </button>
                <button class="btn btn-danger" onclick="cancelSubscription()">
                    サブスクリプションをキャンセル
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function cancelSubscription() {
    document.querySelector('.modal-overlay').remove();
    showNotification('サブスクリプションをキャンセルしました', '2024年2月15日まで利用可能です', 'info');
}

// ===== Workout History Functions =====
function initWorkoutHistory() {
    // Calendar navigation
    const prevBtn = document.querySelector('.calendar-nav .fa-chevron-left')?.parentElement;
    const nextBtn = document.querySelector('.calendar-nav .fa-chevron-right')?.parentElement;
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => navigateCalendar(-1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => navigateCalendar(1));
    }
    
    // Workout item clicks
    const workoutItems = document.querySelectorAll('.workout-item');
    workoutItems.forEach(item => {
        item.addEventListener('click', function() {
            showWorkoutDetails(this);
        });
    });
    
    // Export buttons
    const exportBtns = document.querySelectorAll('.export-btn');
    exportBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.textContent.includes('PDF') ? 'pdf' : 'csv';
            exportWorkoutHistory(format);
        });
    });
}

function navigateCalendar(direction) {
    const monthSpan = document.querySelector('.calendar-nav span');
    if (monthSpan) {
        // Simple month navigation logic
        const currentMonth = monthSpan.textContent;
        showNotification(`${direction > 0 ? '次' : '前'}の月に移動しました`, '', 'info');
    }
}

function showWorkoutDetails(workoutItem) {
    const date = workoutItem.querySelector('.workout-date').textContent;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>ワークアウト詳細 - ${date}</h3>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="workout-detail-section">
                    <h4>レッグデー</h4>
                    <div class="exercise-list">
                        <div class="exercise-detail">
                            <span>バーベルスクワット</span>
                            <span>4セット × 8-10回 @ 80kg</span>
                        </div>
                        <div class="exercise-detail">
                            <span>ルーマニアンデッドリフト</span>
                            <span>3セット × 10-12回 @ 60kg</span>
                        </div>
                        <div class="exercise-detail">
                            <span>レッグプレス</span>
                            <span>3セット × 12-15回 @ 120kg</span>
                        </div>
                    </div>
                </div>
                <div class="workout-notes">
                    <h4>メモ</h4>
                    <p>調子が良く、スクワットで新記録達成！次回は82.5kgに挑戦。</p>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
                    閉じる
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function exportWorkoutHistory(format) {
    showNotification(`ワークアウト履歴を${format.toUpperCase()}形式でエクスポートしています...`, '', 'info');
    
    // Simulate export process
    setTimeout(() => {
        showNotification(`workout_history.${format}をダウンロードしました`, '', 'success');
    }, 2000);
}

// Initialize new screens when they become active
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for screen changes to initialize new screens
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active')) {
                    if (target.id === 'training-environment') {
                        initTrainingEnvironmentSettings();
                    } else if (target.id === 'subscription-management') {
                        initSubscriptionManagement();
                    } else if (target.id === 'profile-edit-screen') {
                        initProfileEditScreen();
                    } else if (target.id === 'goal-settings-screen') {
                        initGoalSettingsScreen();
                    } else if (target.id === 'workout-history') {
                        initWorkoutHistory();
                    }
                }
            }
        });
    });
    
    // Observe all screen elements
    document.querySelectorAll('.screen').forEach(screen => {
        observer.observe(screen, { attributes: true });
    });
});

console.log('🎯 特徴: ゲーミフィケーション、ソーシャル機能、リッチアニメーション、ワークアウトオプション');

// Profile Edit Screen Functionality
function initProfileEditScreen() {
    console.log('Initializing Profile Edit Screen');
    
    // Photo upload functionality
    const photoUploadBtn = document.getElementById('photo-upload-btn');
    const photoUploadInput = document.getElementById('photo-upload-input');
    const photoPreview = document.getElementById('profile-photo-preview');
    const photoLoading = document.querySelector('#profile-edit-screen .photo-loading');
    
    if (photoUploadBtn && photoUploadInput) {
        photoUploadBtn.addEventListener('click', () => {
            photoUploadInput.click();
        });
        
        photoUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                photoLoading.classList.add('active');
                
                reader.onload = (e) => {
                    setTimeout(() => {
                        photoPreview.src = e.target.result;
                        photoLoading.classList.remove('active');
                        showNotification('写真を更新しました', 'success');
                    }, 1000);
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Remove photo functionality
    const removePhotoBtn = document.getElementById('remove-photo-btn');
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', () => {
            if (confirm('プロフィール写真を削除しますか？')) {
                photoPreview.src = 'https://via.placeholder.com/150';
                showNotification('写真を削除しました', 'info');
            }
        });
    }
    
    // Camera button (placeholder)
    const cameraBtn = document.getElementById('camera-btn');
    if (cameraBtn) {
        cameraBtn.addEventListener('click', () => {
            showNotification('カメラ機能は準備中です', 'info');
        });
    }
    
    // Character count for inputs
    setupCharacterCount('name-input');
    setupCharacterCount('nickname-input');
    setupCharacterCount('bio-textarea');
    
    // Gender selection
    const genderBtns = document.querySelectorAll('#profile-edit-screen .gender-btn');
    genderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            genderBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // BMI calculation
    const heightInput = document.getElementById('height-input');
    const weightInput = document.getElementById('weight-input');
    
    if (heightInput && weightInput) {
        const calculateBMI = () => {
            const height = parseFloat(heightInput.value) / 100; // Convert cm to m
            const weight = parseFloat(weightInput.value);
            
            if (height && weight) {
                const bmi = (weight / (height * height)).toFixed(1);
                const bmiValue = document.getElementById('bmi-value');
                const bmiStatus = document.querySelector('#profile-edit-screen .bmi-status');
                const bmiIndicator = document.querySelector('#profile-edit-screen .bmi-indicator');
                
                bmiValue.textContent = bmi;
                
                // Update status and color
                let status, statusClass, position;
                if (bmi < 18.5) {
                    status = '低体重';
                    statusClass = 'underweight';
                    position = Math.max(10, bmi * 4);
                } else if (bmi < 25) {
                    status = '標準';
                    statusClass = 'normal';
                    position = 40 + ((bmi - 18.5) / 6.5) * 30;
                } else if (bmi < 30) {
                    status = '肥満(1度)';
                    statusClass = 'overweight';
                    position = 70 + ((bmi - 25) / 5) * 20;
                } else {
                    status = '肥満(2度以上)';
                    statusClass = 'obese';
                    position = Math.min(90, 70 + (bmi - 25) * 2);
                }
                
                bmiStatus.textContent = status;
                bmiStatus.className = `bmi-status ${statusClass}`;
                bmiIndicator.style.left = `${position}%`;
            }
        };
        
        heightInput.addEventListener('input', calculateBMI);
        weightInput.addEventListener('input', calculateBMI);
        calculateBMI(); // Initial calculation
    }
    
    // Experience level selection
    const experienceBtns = document.querySelectorAll('#profile-edit-screen .experience-btn');
    experienceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            experienceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Training tags selection
    const tagBtns = document.querySelectorAll('#profile-edit-screen .tag-btn');
    tagBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
    });
    
    // Save profile functionality
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const profileSaveBtn = document.getElementById('profile-save-btn');
    
    const saveProfile = () => {
        // Simulate saving
        showNotification('プロフィールを保存中...', 'info');
        
        setTimeout(() => {
            showNotification('プロフィールを更新しました', 'success');
            // Navigate back to profile screen
            showScreen('profile');
        }, 1500);
    };
    
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
    
    if (profileSaveBtn) {
        profileSaveBtn.addEventListener('click', saveProfile);
    }
}

// Helper function to setup character count
function setupCharacterCount(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const charCount = input.parentElement.querySelector('.char-count');
    if (!charCount) return;
    
    const updateCount = () => {
        const current = input.value.length;
        const max = input.maxLength;
        charCount.textContent = `${current}/${max}`;
    };
    
    input.addEventListener('input', updateCount);
    updateCount(); // Initial count
}

// Goal Settings Screen Functionality
function initGoalSettingsScreen() {
    console.log('Initializing Goal Settings Screen');
    
    // Goal selection
    const goalOptionCards = document.querySelectorAll('#goal-settings-screen .goal-option-card');
    const goalDetails = document.querySelectorAll('#goal-settings-screen .goal-detail');
    
    goalOptionCards.forEach(card => {
        card.addEventListener('click', () => {
            // Update active goal
            goalOptionCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // Show corresponding goal details
            const goalType = card.dataset.goal;
            goalDetails.forEach(detail => {
                detail.style.display = 'none';
            });
            
            const targetDetail = document.getElementById(`${goalType}-detail`);
            if (targetDetail) {
                targetDetail.style.display = 'block';
            }
            
            // Update milestones based on goal
            updateMilestones(goalType);
        });
    });
    
    // Weight loss calculations
    const currentWeight = document.getElementById('current-weight');
    const targetWeight = document.getElementById('target-weight');
    const paceBtns = document.querySelectorAll('#goal-settings-screen .pace-btn');
    
    const calculateWeightLoss = () => {
        if (currentWeight && targetWeight) {
            const current = parseFloat(currentWeight.value);
            const target = parseFloat(targetWeight.value);
            const diff = current - target;
            
            const diffElement = document.querySelector('#weight-loss-detail .metric-diff');
            if (diffElement) {
                diffElement.textContent = diff > 0 ? `-${diff}kg` : `+${Math.abs(diff)}kg`;
            }
            
            // Update timeline based on selected pace
            const activePace = document.querySelector('#goal-settings-screen .pace-btn.active');
            if (activePace) {
                updateTimeline(diff, activePace.dataset.pace);
            }
        }
    };
    
    if (currentWeight) currentWeight.addEventListener('input', calculateWeightLoss);
    if (targetWeight) targetWeight.addEventListener('input', calculateWeightLoss);
    
    // Pace selection
    paceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            paceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            calculateWeightLoss();
        });
    });
    
    // Body part selection for muscle gain
    const bodyPartBtns = document.querySelectorAll('#goal-settings-screen .body-part-btn');
    bodyPartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
    });
    
    // Sub goals management
    const addSubGoalBtn = document.querySelector('#goal-settings-screen .add-sub-goal-btn');
    if (addSubGoalBtn) {
        addSubGoalBtn.addEventListener('click', () => {
            showAddSubGoalModal();
        });
    }
    
    // Weekly schedule
    const workoutSlider = document.getElementById('workout-days-slider');
    const frequencyValue = document.querySelector('#goal-settings-screen .frequency-value');
    const weekdayBtns = document.querySelectorAll('#goal-settings-screen .weekday-btn');
    
    if (workoutSlider) {
        workoutSlider.addEventListener('input', (e) => {
            const days = parseInt(e.target.value);
            frequencyValue.textContent = days;
            
            // Auto-select rest days
            const restDays = 7 - days;
            updateRestDays(restDays);
        });
    }
    
    // Manual rest day selection
    weekdayBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('rest-day');
            
            // Update slider based on rest days
            const restDayCount = document.querySelectorAll('#goal-settings-screen .weekday-btn.rest-day').length;
            const workoutDays = 7 - restDayCount;
            if (workoutSlider) {
                workoutSlider.value = workoutDays;
                frequencyValue.textContent = workoutDays;
            }
        });
    });
    
    // Save goals
    const saveGoalsBtn = document.getElementById('save-goals-btn');
    const goalSaveBtn = document.getElementById('goal-save-btn');
    
    const saveGoals = () => {
        showNotification('目標を保存中...', 'info');
        
        setTimeout(() => {
            showNotification('目標を更新しました', 'success');
            showScreen('profile');
        }, 1500);
    };
    
    if (saveGoalsBtn) saveGoalsBtn.addEventListener('click', saveGoals);
    if (goalSaveBtn) goalSaveBtn.addEventListener('click', saveGoals);
    
    // Reset goals
    const resetGoalsBtn = document.querySelector('#goal-settings-screen .reset-goals-btn');
    if (resetGoalsBtn) {
        resetGoalsBtn.addEventListener('click', () => {
            if (confirm('目標設定をリセットしますか？')) {
                resetGoalForm();
                showNotification('目標設定をリセットしました', 'info');
            }
        });
    }
}

// Helper functions for Goal Settings
function updateTimeline(weightDiff, pace) {
    const timeline = document.querySelector('#goal-settings-screen .estimated-timeline p');
    if (!timeline) return;
    
    let weeksNeeded;
    switch (pace) {
        case 'slow':
            weeksNeeded = Math.ceil(weightDiff / 0.25);
            break;
        case 'moderate':
            weeksNeeded = Math.ceil(weightDiff / 0.5);
            break;
        case 'fast':
            weeksNeeded = Math.ceil(weightDiff / 1);
            break;
        default:
            weeksNeeded = Math.ceil(weightDiff / 0.5);
    }
    
    timeline.innerHTML = `目標達成予定: <strong>${weeksNeeded}週間後</strong>`;
}

function updateMilestones(goalType) {
    // Update milestone content based on goal type
    const milestoneItems = document.querySelectorAll('#goal-settings-screen .milestone-item');
    
    // This would be customized based on goal type
    // For now, just animate the update
    milestoneItems.forEach((item, index) => {
        item.style.opacity = '0';
        setTimeout(() => {
            item.style.opacity = '1';
        }, index * 100);
    });
}

function updateRestDays(count) {
    const weekdayBtns = document.querySelectorAll('#goal-settings-screen .weekday-btn');
    const defaultRestDays = ['wed', 'sat']; // Default rest days
    
    // Clear all rest days
    weekdayBtns.forEach(btn => btn.classList.remove('rest-day'));
    
    // Set new rest days
    let assigned = 0;
    defaultRestDays.forEach(day => {
        if (assigned < count) {
            const btn = document.querySelector(`#goal-settings-screen .weekday-btn[data-day="${day}"]`);
            if (btn) {
                btn.classList.add('rest-day');
                assigned++;
            }
        }
    });
}

function showAddSubGoalModal() {
    // Create modal for adding sub goal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>サブ目標を追加</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="add-sub-goal-form">
                    <div class="form-group">
                        <label>目標のカテゴリー</label>
                        <select class="form-input">
                            <option value="nutrition">栄養</option>
                            <option value="exercise">運動</option>
                            <option value="lifestyle">生活習慣</option>
                            <option value="other">その他</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>目標内容</label>
                        <input type="text" class="form-input" placeholder="例: プロテインを毎日摂取する" required>
                    </div>
                    <button type="submit" class="btn-primary">追加</button>
                </form>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    modal.querySelector('#add-sub-goal-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Add the new sub goal to the list
        const subGoalsList = document.querySelector('#goal-settings-screen .sub-goals-list');
        const newGoalText = this.querySelector('input[type="text"]').value;
        const category = this.querySelector('select').value;
        
        const newGoalHtml = `
            <div class="sub-goal-item">
                <input type="checkbox" id="sub-goal-new-${Date.now()}">
                <label for="sub-goal-new-${Date.now()}">
                    <i class="fas fa-${getIconForCategory(category)}"></i>
                    <span>${newGoalText}</span>
                </label>
            </div>
        `;
        
        subGoalsList.insertAdjacentHTML('beforeend', newGoalHtml);
        
        showNotification('サブ目標を追加しました', 'success');
        modal.remove();
    });
}

function getIconForCategory(category) {
    const icons = {
        nutrition: 'apple-alt',
        exercise: 'running',
        lifestyle: 'bed',
        other: 'star'
    };
    return icons[category] || 'star';
}

function resetGoalForm() {
    // Reset all form elements to default
    const inputs = document.querySelectorAll('#goal-settings-screen input[type="number"]');
    inputs.forEach(input => {
        input.value = input.defaultValue || '';
    });
    
    // Reset selections
    const activeElements = document.querySelectorAll('#goal-settings-screen .active');
    activeElements.forEach(el => {
        if (!el.querySelector('[data-goal="weight-loss"]')) {
            el.classList.remove('active');
        }
    });
    
    // Reset checkboxes
    const checkboxes = document.querySelectorAll('#goal-settings-screen input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = cb.defaultChecked || false;
    });
}

// Enhanced App Settings Functionality
function initializeAppSettings() {
    // Theme Selector
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            const theme = this.dataset.theme;
            applyTheme(theme);
            showNotification(`テーマを${this.querySelector('span').textContent}に変更しました`, 'success');
        });
    });

    // Expandable Settings
    const expandableItems = document.querySelectorAll('.settings-item.expandable');
    expandableItems.forEach(item => {
        const header = item.querySelector('.settings-item-info');
        header.addEventListener('click', function() {
            item.classList.toggle('expanded');
        });
    });

    // Font Size Control
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            sizeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const size = this.dataset.size;
            document.documentElement.style.setProperty('--font-size-base', 
                size === 'small' ? '14px' : size === 'large' ? '18px' : '16px');
            showNotification('フォントサイズを変更しました', 'success');
        });
    });

    // Color Options
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            const color = this.style.backgroundColor;
            document.documentElement.style.setProperty('--accent', color);
            showNotification('アクセントカラーを変更しました', 'success');
        });
    });

    // Unit Toggles
    const unitToggles = document.querySelectorAll('.unit-toggle');
    unitToggles.forEach(toggle => {
        const buttons = toggle.querySelectorAll('.unit-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                buttons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const unit = this.dataset.unit;
                // Save unit preference
                localStorage.setItem(`unit-${toggle.closest('.settings-item').querySelector('h4').textContent}`, unit);
                showNotification(`単位を${this.textContent}に変更しました`, 'success');
            });
        });
    });

    // Time Selector
    const timeSelectors = document.querySelectorAll('.time-selector');
    timeSelectors.forEach(selector => {
        const minusBtn = selector.querySelector('.minus');
        const plusBtn = selector.querySelector('.plus');
        const valueSpan = selector.querySelector('.time-value');
        
        let value = 90; // Default 90 seconds
        
        minusBtn.addEventListener('click', function() {
            if (value > 30) {
                value -= 15;
                valueSpan.textContent = `${value}秒`;
            }
        });
        
        plusBtn.addEventListener('click', function() {
            if (value < 300) {
                value += 15;
                valueSpan.textContent = `${value}秒`;
            }
        });
    });

    // Cache Clear Button
    const cacheClearBtn = document.querySelector('.settings-item button:has(.cache-size)');
    if (cacheClearBtn) {
        cacheClearBtn.addEventListener('click', function() {
            const cacheSize = this.querySelector('.cache-size');
            showConfirmDialog('キャッシュをクリアしますか？', '一時ファイルが削除されます。', () => {
                // Simulate cache clearing
                cacheSize.textContent = '0MB';
                showNotification('キャッシュをクリアしました', 'success');
            });
        });
    }

    // Export/Import Buttons
    const exportBtn = document.querySelector('.settings-item button:has(.fa-download)');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            showNotification('データをエクスポート中...', 'info');
            setTimeout(() => {
                showNotification('データのエクスポートが完了しました', 'success');
            }, 2000);
        });
    }

    const importBtn = document.querySelector('.settings-item button:has(.fa-upload)');
    if (importBtn) {
        importBtn.addEventListener('click', function() {
            // Create file input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv,.json';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    showNotification(`${file.name}をインポート中...`, 'info');
                    setTimeout(() => {
                        showNotification('データのインポートが完了しました', 'success');
                    }, 2000);
                }
            };
            input.click();
        });
    }

    // Danger Zone Buttons
    const resetAppBtn = Array.from(document.querySelectorAll('.settings-item.danger button')).find(btn => btn.textContent.includes('リセット'));
    if (resetAppBtn) {
        resetAppBtn.addEventListener('click', function() {
            showConfirmDialog(
                'アプリをリセットしますか？',
                'すべての設定が初期状態に戻ります。この操作は取り消せません。',
                () => {
                    showNotification('アプリをリセットしています...', 'info');
                    setTimeout(() => {
                        localStorage.clear();
                        location.reload();
                    }, 1500);
                },
                true // danger style
            );
        });
    }

    const deleteDataBtn = Array.from(document.querySelectorAll('.settings-item.danger button')).find(btn => btn.textContent.includes('削除'));
    if (deleteDataBtn) {
        deleteDataBtn.addEventListener('click', function() {
            showConfirmDialog(
                'すべてのデータを削除しますか？',
                'ワークアウト履歴、目標、プロフィールなど、すべてのデータが完全に削除されます。この操作は取り消せません。',
                () => {
                    showNotification('データを削除しています...', 'info');
                    setTimeout(() => {
                        localStorage.clear();
                        showNotification('すべてのデータが削除されました', 'success');
                        setTimeout(() => location.reload(), 1000);
                    }, 1500);
                },
                true // danger style
            );
        });
    }

    // Version Check Button
    const versionBtn = Array.from(document.querySelectorAll('.settings-item button')).find(btn => btn.textContent.includes('更新確認'));
    if (versionBtn) {
        versionBtn.addEventListener('click', function() {
            showNotification('更新を確認中...', 'info');
            setTimeout(() => {
                showNotification('最新バージョンです', 'success');
            }, 1500);
        });
    }

    // Rating Button
    const ratingBtn = document.querySelector('.btn-primary.small:has(.fa-star)');
    if (ratingBtn) {
        ratingBtn.addEventListener('click', function() {
            showNotification('App Storeに移動します...', 'info');
            setTimeout(() => {
                window.open('https://apps.apple.com', '_blank');
            }, 1000);
        });
    }

    // Support Email Button
    const supportBtn = document.querySelector('.btn-secondary.small:has(.fa-envelope)');
    if (supportBtn) {
        supportBtn.addEventListener('click', function() {
            window.location.href = 'mailto:support@gymmee.com?subject=GymMeeサポート';
        });
    }
}

// Helper function to apply theme
function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
        root.style.setProperty('--bg-primary', '#f8f9fa');
        root.style.setProperty('--bg-secondary', '#ffffff');
        root.style.setProperty('--text-primary', '#1a1a1a');
        root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.9)');
    } else if (theme === 'dark') {
        root.style.setProperty('--bg-primary', '#0a0a0a');
        root.style.setProperty('--bg-secondary', '#1a1a1a');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--glass-bg', 'rgba(20, 20, 20, 0.8)');
    } else {
        // Auto theme based on system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }
}

// Helper function to show confirm dialog
function showConfirmDialog(title, message, onConfirm, isDanger = false) {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
        <div class="modal-content confirm-dialog ${isDanger ? 'danger' : ''}">
            <div class="modal-header">
                <h3>${title}</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    キャンセル
                </button>
                <button class="${isDanger ? 'btn-danger' : 'btn-primary'}" id="confirm-btn">
                    ${isDanger ? '削除する' : '確認'}
                </button>
            </div>
        </div>
    `;
    
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(dialog);
    
    dialog.querySelector('#confirm-btn').addEventListener('click', function() {
        onConfirm();
        dialog.remove();
    });
}

// Initialize app settings when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeAppSettings();
});

// Polyfill for :contains selector
if (!document.querySelector.contains) {
    document.querySelector.contains = function(text) {
        const elements = document.querySelectorAll('*');
        return Array.from(elements).find(el => el.textContent.includes(text));
    };
}




// プライバシー設定画面の機能
function initPrivacySettingsScreen() {
    // プライバシーレベルの更新
    updatePrivacyLevel();
    
    // すべてのトグルスイッチとセレクトにイベントリスナーを追加
    const privacyToggles = document.querySelectorAll("#privacy-settings-screen input[type=\"checkbox\"]");
    const privacySelects = document.querySelectorAll("#privacy-settings-screen select");
    
    privacyToggles.forEach(toggle => {
        toggle.addEventListener("change", updatePrivacyLevel);
    });
    
    privacySelects.forEach(select => {
        select.addEventListener("change", updatePrivacyLevel);
    });
}

// プライバシーレベルを計算して表示を更新
function updatePrivacyLevel() {
    const toggles = document.querySelectorAll("#privacy-settings-screen input[type=\"checkbox\"]");
    const selects = document.querySelectorAll("#privacy-settings-screen select");
    
    let privacyScore = 0;
    let maxScore = 0;
    
    // トグルスイッチのスコア計算
    toggles.forEach(toggle => {
        maxScore += 1;
        if (!toggle.checked || toggle.closest(".privacy-option").textContent.includes("広告") || 
            toggle.closest(".privacy-option").textContent.includes("データ収集")) {
            if (!toggle.checked) privacyScore += 1;
        } else {
            if (toggle.checked) privacyScore += 1;
        }
    });
    
    // セレクトボックスのスコア計算
    selects.forEach(select => {
        maxScore += 2;
        if (select.value === "private" || select.value === "none") {
            privacyScore += 2;
        } else if (select.value === "friends" || select.value === "month" || select.value === "week") {
            privacyScore += 1;
        }
    });
    
    const percentage = (privacyScore / maxScore) * 100;
    const levelFill = document.querySelector(".level-fill");
    const levelText = document.querySelector(".level-text");
    const levelDescription = document.querySelector(".level-description");
    
    if (levelFill) {
        levelFill.style.width = percentage + "%";
    }
    
    if (levelText && levelDescription) {
        if (percentage >= 80) {
            levelText.textContent = "高";
            levelDescription.textContent = "ほとんどの情報が保護されています";
        } else if (percentage >= 50) {
            levelText.textContent = "中";
            levelDescription.textContent = "基本的な保護が有効です";
        } else {
            levelText.textContent = "低";
            levelDescription.textContent = "多くの情報が共有されています";
        }
    }
}

// プライバシープリセットの設定
function setPrivacyPreset(preset) {
    const toggles = document.querySelectorAll("#privacy-settings-screen input[type=\"checkbox\"]");
    const selects = document.querySelectorAll("#privacy-settings-screen select");
    const buttons = document.querySelectorAll(".quick-setting-btn");
    
    // ボタンのアクティブ状態を更新
    buttons.forEach(btn => {
        btn.classList.remove("active");
        if (btn.onclick && btn.onclick.toString().includes(preset)) {
            btn.classList.add("active");
        }
    });
    
    switch(preset) {
        case "maximum":
            // 最大プライバシー設定
            selects.forEach(select => {
                const privateOption = select.querySelector("option[value=\"private\"]") || 
                                    select.querySelector("option[value=\"none\"]");
                if (privateOption) {
                    select.value = privateOption.value;
                }
            });
            toggles.forEach(toggle => {
                const option = toggle.closest(".privacy-option");
                if (option.textContent.includes("広告") || option.textContent.includes("データ収集") || 
                    option.textContent.includes("オンラインステータス") || option.textContent.includes("アクティビティ通知")) {
                    toggle.checked = false;
                } else {
                    toggle.checked = true;
                }
            });
            break;
            
        case "balanced":
            // バランス型設定
            selects.forEach(select => {
                const friendsOption = select.querySelector("option[value=\"friends\"]") || 
                                    select.querySelector("option[value=\"month\"]");
                if (friendsOption) {
                    select.value = friendsOption.value;
                }
            });
            toggles.forEach(toggle => {
                const option = toggle.closest(".privacy-option");
                if (option.textContent.includes("広告")) {
                    toggle.checked = false;
                } else {
                    toggle.checked = true;
                }
            });
            break;
            
        case "social":
            // ソーシャル型設定
            selects.forEach(select => {
                const publicOption = select.querySelector("option[value=\"public\"]") || 
                                   select.querySelector("option[value=\"all\"]");
                if (publicOption) {
                    select.value = publicOption.value;
                }
            });
            toggles.forEach(toggle => {
                toggle.checked = true;
            });
            break;
    }
    
    // プライバシーレベルを更新
    updatePrivacyLevel();
}

// 画面初期化時に実行
if (document.querySelector("#privacy-settings-screen")) {
    initPrivacySettingsScreen();
}


// アプリ連携管理画面の機能
function initIntegrationManagementScreen() {
    // タブ切り替え機能
    const tabButtons = document.querySelectorAll(".integration-tabs .tab-btn");
    const integrationItems = document.querySelectorAll(".integration-item");
    
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const selectedTab = button.getAttribute("data-tab");
            
            // アクティブタブの更新
            tabButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            
            // フィルタリング（実際の実装では各アプリにカテゴリーを設定）
            // ここではデモとして全て表示
            integrationItems.forEach(item => {
                item.style.display = "flex";
            });
        });
    });
    
    // 接続トグル機能
    const toggleButtons = document.querySelectorAll(".integration-toggle");
    toggleButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (button.classList.contains("connected")) {
                // 切断確認
                if (confirm("このアプリとの連携を解除しますか？")) {
                    button.classList.remove("connected");
                    button.textContent = "接続する";
                    
                    // ステータステキストの更新
                    const statusText = button.closest(".integration-item").querySelector(".integration-status");
                    if (statusText) {
                        statusText.classList.remove("connected");
                        statusText.textContent = statusText.textContent.replace("同期中", "");
                    }
                    
                    // 統計の更新
                    updateIntegrationStats();
                }
            } else {
                // 接続処理（実際にはOAuth等の認証フロー）
                button.classList.add("connected");
                button.textContent = "接続中";
                
                // ステータステキストの更新
                const statusText = button.closest(".integration-item").querySelector(".integration-status");
                if (statusText) {
                    statusText.classList.add("connected");
                }
                
                // 統計の更新
                updateIntegrationStats();
            }
        });
    });
    
    // 全て同期ボタン
    const syncAllBtn = document.querySelector(".btn-sync-all");
    if (syncAllBtn) {
        syncAllBtn.addEventListener("click", () => {
            const icon = syncAllBtn.querySelector("i");
            icon.style.animationPlayState = "running";
            
            // 同期処理のシミュレーション
            setTimeout(() => {
                icon.style.animationPlayState = "paused";
                updateSyncStatus();
                addSyncHistoryItem("全アプリ", "成功", "8件のデータを同期");
            }, 2000);
        });
    }
    
    // 設定ボタン
    const settingsButtons = document.querySelectorAll(".btn-integration-settings");
    settingsButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.stopPropagation();
            const appName = button.closest(".integration-item").querySelector(".integration-name").textContent;
            alert(appName + "の詳細設定画面を開きます");
        });
    });
    
    // 情報ボタン
    const infoButtons = document.querySelectorAll(".btn-integration-info");
    infoButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.stopPropagation();
            const appName = button.closest(".integration-item").querySelector(".integration-name").textContent;
            alert(appName + "の詳細情報を表示します");
        });
    });
}

// 統計情報の更新
function updateIntegrationStats() {
    const connectedCount = document.querySelectorAll(".integration-toggle.connected").length;
    const statValue = document.querySelector(".stat-value");
    if (statValue) {
        statValue.textContent = connectedCount;
    }
}

// 同期ステータスの更新
function updateSyncStatus() {
    const syncStatus = document.querySelector(".sync-status");
    if (syncStatus) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        syncStatus.textContent = `最終一括同期: 今日 ${hours}:${minutes}`;
    }
}

// 同期履歴にアイテムを追加
function addSyncHistoryItem(appName, status, data) {
    const historyList = document.querySelector(".sync-history-list");
    if (!historyList) return;
    
    const syncItem = document.createElement("div");
    syncItem.className = `sync-item ${status === "成功" ? "success" : "error"}`;
    syncItem.innerHTML = `
        <div class="sync-icon">
            <i class="fas fa-${status === "成功" ? "check" : "exclamation"}-circle"></i>
        </div>
        <div class="sync-details">
            <span class="sync-app">${appName}</span>
            <span class="sync-time">たった今</span>
        </div>
        <span class="sync-data">${data}</span>
    `;
    
    historyList.insertBefore(syncItem, historyList.firstChild);
    
    // 古いアイテムを削除（最大3件表示）
    while (historyList.children.length > 3) {
        historyList.removeChild(historyList.lastChild);
    }
}

// 画面初期化時に実行
if (document.querySelector("#integration-management-screen")) {
    initIntegrationManagementScreen();
}


// ヘルプ＆サポート画面の機能
function initHelpSupportScreen() {
    // 検索サジェスト機能
    const searchInput = document.getElementById("help-search");
    const suggestions = document.getElementById("search-suggestions");
    
    if (searchInput) {
        searchInput.addEventListener("focus", () => {
            suggestions.style.display = "block";
        });
        
        searchInput.addEventListener("blur", () => {
            setTimeout(() => {
                suggestions.style.display = "none";
            }, 200);
        });
        
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length > 0) {
                // 実際の実装では検索APIを呼び出す
                suggestions.style.display = "block";
            } else {
                suggestions.style.display = "none";
            }
        });
    }
    
    // カテゴリークリック
    const categoryCards = document.querySelectorAll(".help-category-card");
    categoryCards.forEach(card => {
        card.addEventListener("click", () => {
            const category = card.getAttribute("data-category");
            // カテゴリー別の記事一覧を表示
            console.log("カテゴリー選択:", category);
        });
    });
    
    // もっと見るボタン
    const showMoreBtn = document.querySelector(".btn-show-more");
    if (showMoreBtn) {
        showMoreBtn.addEventListener("click", () => {
            // 追加のFAQを読み込む
            console.log("追加のFAQを表示");
        });
    }
    
    // ビデオカードクリック
    const videoCards = document.querySelectorAll(".video-card");
    videoCards.forEach(card => {
        card.addEventListener("click", () => {
            // ビデオ再生画面を開く
            console.log("ビデオを再生");
        });
    });
}

// FAQ開閉機能
function toggleFAQ(button) {
    const faqItem = button.closest(".faq-item");
    const isExpanded = faqItem.classList.contains("expanded");
    
    // 他のFAQを閉じる
    document.querySelectorAll(".faq-item.expanded").forEach(item => {
        if (item !== faqItem) {
            item.classList.remove("expanded");
        }
    });
    
    // 現在のFAQをトグル
    faqItem.classList.toggle("expanded");
    
    // アナリティクスイベントを送信（実際の実装で）
    if (!isExpanded) {
        const question = button.querySelector("span").textContent;
        console.log("FAQ展開:", question);
    }
}

// ライブチャット開始
function startLiveChat() {
    // チャットウィンドウを開く
    console.log("ライブチャット開始");
    alert("サポートチームに接続中です...");
}

// ビデオチュートリアル表示
function showVideoTutorials() {
    // ビデオチュートリアル一覧を表示
    console.log("ビデオチュートリアル一覧を表示");
}

// 役に立ったボタンのクリック処理
document.addEventListener("click", (e) => {
    if (e.target.closest(".btn-helpful")) {
        const button = e.target.closest(".btn-helpful");
        button.classList.add("active");
        button.innerHTML = `<i class="fas fa-check"></i> ありがとうございます`;
        
        // 反対のボタンを無効化
        const notHelpfulBtn = button.parentElement.querySelector(".btn-not-helpful");
        if (notHelpfulBtn) {
            notHelpfulBtn.disabled = true;
            notHelpfulBtn.style.opacity = "0.5";
        }
    }
    
    if (e.target.closest(".btn-not-helpful")) {
        const button = e.target.closest(".btn-not-helpful");
        button.classList.add("active");
        
        // フィードバックフォームを表示（実際の実装で）
        console.log("改善フィードバックを収集");
        
        // 反対のボタンを無効化
        const helpfulBtn = button.parentElement.querySelector(".btn-helpful");
        if (helpfulBtn) {
            helpfulBtn.disabled = true;
            helpfulBtn.style.opacity = "0.5";
        }
    }
});

// 画面初期化時に実行
if (document.querySelector("#help-support-screen")) {
    initHelpSupportScreen();
}
