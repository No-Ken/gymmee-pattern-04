// Onboarding state management
let currentStep = 0;
const totalSteps = 9;
const steps = [
    'step-welcome',
    'step-basic-info',
    'step-body-info',
    'step-goals',
    'step-preferences',
    'step-health',
    'step-experience',
    'step-schedule',
    'step-complete'
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    initializeInteractiveElements();
    
    // Initialize duration calculations for pre-checked weekdays
    const checkedWeekdays = document.querySelectorAll('.weekday-checkbox input:checked');
    checkedWeekdays.forEach(checkbox => {
        const timeSlot = checkbox.closest('.weekday-item').querySelector('.time-slot');
        if (timeSlot) {
            calculateDuration(timeSlot);
        }
    });
});

// Navigation functions
function nextStep() {
    if (currentStep < totalSteps - 1) {
        // Hide current step
        document.getElementById(steps[currentStep]).classList.remove('active');
        
        // Show next step
        currentStep++;
        document.getElementById(steps[currentStep]).classList.add('active');
        
        // Update progress
        updateProgress();
        
        // Scroll to top
        document.querySelector('.onboarding-main').scrollTo(0, 0);
    }
}

function previousStep() {
    if (currentStep > 0) {
        // Hide current step
        document.getElementById(steps[currentStep]).classList.remove('active');
        
        // Show previous step
        currentStep--;
        document.getElementById(steps[currentStep]).classList.add('active');
        
        // Update progress
        updateProgress();
        
        // Scroll to top
        document.querySelector('.onboarding-main').scrollTo(0, 0);
    }
}

// Update progress bar and dots
function updateProgress() {
    const progressPercent = ((currentStep + 1) / totalSteps) * 100;
    document.getElementById('progress-fill').style.width = progressPercent + '%';
    
    // Update progress dots
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, index) => {
        if (index <= currentStep) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Toggle injury details
function toggleInjuryDetails(checkbox) {
    const injuryDetails = document.getElementById('injury-details');
    const anyChecked = document.querySelectorAll('input[name="injury"]:checked').length > 0;
    
    if (anyChecked) {
        injuryDetails.style.display = 'block';
    } else {
        injuryDetails.style.display = 'none';
    }
}

// Skip onboarding
function skipOnboarding() {
    if (confirm('既存のアカウントにログインしますか？')) {
        window.location.href = 'login.html';
    }
}

// Start app
function startApp() {
    // Save onboarding completion
    localStorage.setItem('onboardingCompleted', 'true');
    
    // Redirect to main app
    window.location.href = 'index.html';
}

// Start without premium
function startWithoutPremium() {
    startApp();
}

// Initialize interactive elements
function initializeInteractiveElements() {
    // Gender selection
    const genderOptions = document.querySelectorAll('.gender-option');
    genderOptions.forEach(option => {
        option.addEventListener('click', function() {
            genderOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Activity level selection
    const activityOptions = document.querySelectorAll('.activity-option');
    activityOptions.forEach(option => {
        option.addEventListener('click', function() {
            activityOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Goal selection
    const goalCards = document.querySelectorAll('.goal-card');
    goalCards.forEach(card => {
        card.addEventListener('click', function() {
            goalCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Exercise type selection (preferences)
    const exerciseTypes = document.querySelectorAll('.exercise-type-card');
    exerciseTypes.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
    
    // Equipment selection
    const equipmentBtns = document.querySelectorAll('.equipment-btn');
    equipmentBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            equipmentBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Experience selection
    const experienceCards = document.querySelectorAll('.experience-card');
    experienceCards.forEach(card => {
        card.addEventListener('click', function() {
            experienceCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Days slider
    const daysSlider = document.getElementById('days-slider');
    const daysNumber = document.getElementById('days-number');
    if (daysSlider) {
        daysSlider.addEventListener('input', function() {
            daysNumber.textContent = this.value;
            updateWeekdaySelection(parseInt(this.value));
        });
    }
    
    // Weekday selection
    const weekdayBtns = document.querySelectorAll('.weekday-btn');
    weekdayBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            updateDaysFromWeekdays();
        });
    });
    
    // Duration selection
    const durationOptions = document.querySelectorAll('.duration-option');
    durationOptions.forEach(option => {
        option.addEventListener('click', function() {
            durationOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Update weekday selection based on days count
function updateWeekdaySelection(days) {
    const weekdayBtns = document.querySelectorAll('.weekday-btn');
    const activeCount = document.querySelectorAll('.weekday-btn.active').length;
    
    if (activeCount !== days) {
        // Auto-select weekdays based on days count
        weekdayBtns.forEach(btn => btn.classList.remove('active'));
        
        // Select evenly distributed days
        const interval = Math.floor(7 / days);
        for (let i = 0; i < days; i++) {
            const index = Math.min(i * interval, 6);
            weekdayBtns[index].classList.add('active');
        }
    }
}

// Update days slider from weekday selection
function updateDaysFromWeekdays() {
    const activeWeekdays = document.querySelectorAll('.weekday-checkbox input:checked').length;
    const daysSlider = document.getElementById('days-slider');
    const daysNumber = document.getElementById('days-number');
    
    if (daysSlider && activeWeekdays > 0) {
        daysSlider.value = activeWeekdays;
        daysNumber.textContent = activeWeekdays;
    }
}

// Calculate and display duration between start and end times
function calculateDuration(timeSlot) {
    const startInput = timeSlot.querySelector('.start-time');
    const endInput = timeSlot.querySelector('.end-time');
    const durationDisplay = timeSlot.querySelector('.duration-value');
    
    if (!startInput.value || !endInput.value) {
        durationDisplay.textContent = '--';
        return;
    }
    
    const start = new Date(`2000-01-01T${startInput.value}`);
    const end = new Date(`2000-01-01T${endInput.value}`);
    
    // Handle case where end time is on the next day
    if (end < start) {
        end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    if (hours > 0 && minutes > 0) {
        durationDisplay.textContent = `${hours}時間${minutes}分`;
    } else if (hours > 0) {
        durationDisplay.textContent = `${hours}時間`;
    } else {
        durationDisplay.textContent = `${minutes}分`;
    }
}

// Validate that end time is after start time
function validateTimeRange(timeSlot) {
    const startInput = timeSlot.querySelector('.start-time');
    const endInput = timeSlot.querySelector('.end-time');
    
    if (!startInput.value || !endInput.value) {
        return;
    }
    
    const start = new Date(`2000-01-01T${startInput.value}`);
    const end = new Date(`2000-01-01T${endInput.value}`);
    
    // Allow end time to be on "next day" (e.g., 23:00 to 01:00)
    if (end < start) {
        const diffMs = (24 * 60 * 60 * 1000) - (start - end);
        const diffHours = diffMs / (60 * 60 * 1000);
        
        // If the difference is more than 12 hours when treating as next day,
        // it's probably an error
        if (diffHours > 12) {
            endInput.setCustomValidity('終了時間は開始時間より後に設定してください');
            endInput.reportValidity();
        } else {
            endInput.setCustomValidity('');
        }
    } else {
        endInput.setCustomValidity('');
    }
}

// Form validation (basic example)
function validateCurrentStep() {
    const currentStepElement = document.getElementById(steps[currentStep]);
    const requiredInputs = currentStepElement.querySelectorAll('input[required]');
    
    for (let input of requiredInputs) {
        if (!input.value.trim()) {
            input.focus();
            input.style.borderColor = 'var(--accent)';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 2000);
            return false;
        }
    }
    
    return true;
}

// Add validation to next button clicks
const originalNextStep = nextStep;
nextStep = function() {
    if (validateCurrentStep()) {
        originalNextStep();
    }
};

// Goal selection
function selectGoal(goalType) {
    // Update active state
    const goalCards = document.querySelectorAll('.goal-card');
    goalCards.forEach(card => card.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Hide all goal detail sections
    const detailSections = document.querySelectorAll('.goal-detail-section');
    detailSections.forEach(section => section.style.display = 'none');
    
    // Show selected goal details
    const selectedSection = document.getElementById(goalType + '-details');
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
}

// Equipment selection
function selectEquipment(type) {
    const equipmentOptions = document.querySelectorAll('.equipment-option');
    equipmentOptions.forEach(option => option.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// Initialize new interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Exercise type cards
    const exerciseCards = document.querySelectorAll('.exercise-type-card');
    exerciseCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
    
    // Weekday schedule
    const weekdayCheckboxes = document.querySelectorAll('.weekday-checkbox input');
    weekdayCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const timeSlot = this.closest('.weekday-item').querySelector('.time-slot');
            const weekday = this.value;
            
            if (this.checked) {
                timeSlot.style.display = 'block';
                // Set default times if not already set
                const startTime = timeSlot.querySelector('.start-time');
                const endTime = timeSlot.querySelector('.end-time');
                if (!startTime.value && !endTime.value) {
                    // Set different default times based on weekday
                    if (weekday === 'saturday' || weekday === 'sunday') {
                        startTime.value = '09:00';
                        endTime.value = '10:30';
                    } else {
                        startTime.value = '18:00';
                        endTime.value = '19:00';
                    }
                    calculateDuration(timeSlot);
                }
                
                // Set default exercise types and intensity based on day
                setDefaultExerciseOptions(weekday, timeSlot);
            } else {
                timeSlot.style.display = 'none';
            }
            updateDaysFromWeekdays();
        });
    });
    
    // Time input listeners for duration calculation
    const timeInputs = document.querySelectorAll('.start-time, .end-time');
    timeInputs.forEach(input => {
        input.addEventListener('change', function() {
            const timeSlot = this.closest('.time-slot');
            calculateDuration(timeSlot);
            validateTimeRange(timeSlot);
        });
    });
    
    // Set minimum date for deadline
    const deadlineInput = document.getElementById('deadline-input');
    if (deadlineInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        deadlineInput.min = tomorrow.toISOString().split('T')[0];
    }
});

// Set default exercise options based on weekday
function setDefaultExerciseOptions(weekday, timeSlot) {
    const exerciseCheckboxes = timeSlot.querySelectorAll('.exercise-type-checkbox input[type="checkbox"]');
    const intensityRadios = timeSlot.querySelectorAll('.intensity-btn input[type="radio"]');
    
    // Clear all selections first
    exerciseCheckboxes.forEach(cb => cb.checked = false);
    
    // Set defaults based on day
    switch(weekday) {
        case 'sunday':
            // Sunday: Recovery day - Yoga/Stretching and Recovery, Low intensity
            exerciseCheckboxes.forEach(cb => {
                if (cb.value === 'yoga' || cb.value === 'recovery') {
                    cb.checked = true;
                }
            });
            intensityRadios.forEach(radio => {
                if (radio.value === 'low') {
                    radio.checked = true;
                }
            });
            break;
            
        case 'saturday':
            // Saturday: Active recovery or sports - Cardio or Sports, Medium intensity
            exerciseCheckboxes.forEach(cb => {
                if (cb.value === 'cardio' || cb.value === 'sports') {
                    cb.checked = true;
                }
            });
            intensityRadios.forEach(radio => {
                if (radio.value === 'medium') {
                    radio.checked = true;
                }
            });
            break;
            
        case 'friday':
            // Friday: High energy day - HIIT and Cardio, High intensity
            exerciseCheckboxes.forEach(cb => {
                if (cb.value === 'hiit' || cb.value === 'cardio') {
                    cb.checked = true;
                }
            });
            intensityRadios.forEach(radio => {
                if (radio.value === 'high') {
                    radio.checked = true;
                }
            });
            break;
            
        case 'monday':
        case 'wednesday':
            // Monday/Wednesday: Strength days - Weight Training, Medium intensity
            exerciseCheckboxes.forEach(cb => {
                if (cb.value === 'weight') {
                    cb.checked = true;
                }
            });
            intensityRadios.forEach(radio => {
                if (radio.value === 'medium') {
                    radio.checked = true;
                }
            });
            break;
            
        case 'tuesday':
        case 'thursday':
            // Tuesday/Thursday: Mixed days - Cardio and some weights, Medium intensity
            exerciseCheckboxes.forEach(cb => {
                if (cb.value === 'cardio' || cb.value === 'weight') {
                    cb.checked = true;
                }
            });
            intensityRadios.forEach(radio => {
                if (radio.value === 'medium') {
                    radio.checked = true;
                }
            });
            break;
            
        default:
            // Default: balanced approach
            exerciseCheckboxes.forEach(cb => {
                if (cb.value === 'weight') {
                    cb.checked = true;
                }
            });
            intensityRadios.forEach(radio => {
                if (radio.value === 'medium') {
                    radio.checked = true;
                }
            });
    }
}