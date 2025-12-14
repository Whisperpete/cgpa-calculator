// DOM Elements
const coursesList = document.getElementById('coursesList');
const addCourseBtn = document.getElementById('addCourseBtn');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const aboutBtn = document.getElementById('aboutBtn');
const closeModal = document.getElementById('closeModal');
const aboutModal = document.getElementById('aboutModal');
const cgpaResult = document.getElementById('cgpaResult');
const gradeResult = document.getElementById('gradeResult');
const totalCourses = document.getElementById('totalCourses');
const totalGradePoints = document.getElementById('totalGradePoints');
const totalCredits = document.getElementById('totalCredits');
const currentYear = document.getElementById('currentYear');

// Reset modal elements
const resetModal = document.getElementById('resetModal');
const closeResetModal = document.getElementById('closeResetModal');
const confirmResetBtn = document.getElementById('confirmResetBtn');
const cancelResetBtn = document.getElementById('cancelResetBtn');

// Grade point mapping
const gradePoints = {
    'A': 5.0,
    'B': 4.0,
    'C': 3.0,
    'D': 2.0,
    'E': 1.0,
    'F': 0.0
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    currentYear.textContent = new Date().getFullYear();
    
    // Add first course on load
    addCourse();
    
    // Event listeners
    addCourseBtn.addEventListener('click', addCourse);
    calculateBtn.addEventListener('click', calculateCGPA);
    resetBtn.addEventListener('click', openResetModal);
    aboutBtn.addEventListener('click', openAboutModal);
    closeModal.addEventListener('click', closeAboutModal);
    
    // Reset modal event listeners
    closeResetModal.addEventListener('click', closeResetModalFunc);
    confirmResetBtn.addEventListener('click', confirmReset);
    cancelResetBtn.addEventListener('click', closeResetModalFunc);
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === aboutModal) {
            closeAboutModal();
        }
        if (event.target === resetModal) {
            closeResetModalFunc();
        }
    });
});

// Add a new course input row
function addCourse() {
    const courseId = Date.now(); // Unique ID for each course
    const courseItem = document.createElement('div');
    courseItem.className = 'course-item';
    courseItem.id = `course-${courseId}`;
    
    courseItem.innerHTML = `
        <div class="course-input">
            <label for="courseName-${courseId}">Course Name</label>
            <input type="text" id="courseName-${courseId}" placeholder="e.g., Mathematics 101" class="course-name">
        </div>
        <div class="course-input">
            <label for="grade-${courseId}">Grade</label>
            <select id="grade-${courseId}" class="course-grade">
                <option value="A">A (5.0 points)</option>
                <option value="B">B (4.0 points)</option>
                <option value="C">C (3.0 points)</option>
                <option value="D">D (2.0 points)</option>
                <option value="E">E (1.0 points)</option>
                <option value="F">F (0.0 points)</option>
            </select>
        </div>
        <div class="course-input">
            <label for="credits-${courseId}">Credit Units</label>
            <input type="number" id="credits-${courseId}" min="1" max="10" value="3" class="course-credits">
        </div>
        <button type="button" class="remove-course" onclick="removeCourse(${courseId})">
            <i class="fas fa-trash"></i> Remove
        </button>
    `;
    
    coursesList.appendChild(courseItem);
    
    // Scroll to the newly added course
    courseItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Update course count
    updateCourseCount();
}

// Remove a course input row
function removeCourse(courseId) {
    const courseElement = document.getElementById(`course-${courseId}`);
    if (courseElement) {
        // Add fade out animation before removing
        courseElement.style.opacity = '0';
        courseElement.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            courseElement.remove();
            updateCourseCount();
        }, 300);
    }
}

// Update the course count display
function updateCourseCount() {
    const courseCount = document.querySelectorAll('.course-item').length;
    totalCourses.textContent = courseCount;
}

// Calculate CGPA
function calculateCGPA() {
    const courseItems = document.querySelectorAll('.course-item');
    
    if (courseItems.length === 0) {
        showNotification('Please add at least one course to calculate CGPA.', 'warning');
        return;
    }
    
    let totalGradePointsSum = 0;
    let totalCreditsSum = 0;
    let hasInvalidInput = false;
    let invalidCourseName = '';
    
    // Loop through all courses
    courseItems.forEach(course => {
        const gradeSelect = course.querySelector('.course-grade');
        const creditsInput = course.querySelector('.course-credits');
        const courseNameInput = course.querySelector('.course-name');
        
        // Validate inputs
        if (!courseNameInput.value.trim()) {
            invalidCourseName = 'Please enter a course name for all courses.';
            courseNameInput.focus();
            courseNameInput.style.borderColor = 'var(--danger)';
            hasInvalidInput = true;
            return;
        } else {
            courseNameInput.style.borderColor = '';
        }
        
        const grade = gradeSelect.value;
        const credits = parseFloat(creditsInput.value);
        
        if (isNaN(credits) || credits <= 0) {
            showNotification('Please enter valid credit units (greater than 0) for all courses.', 'warning');
            creditsInput.focus();
            creditsInput.style.borderColor = 'var(--danger)';
            hasInvalidInput = true;
            return;
        } else {
            creditsInput.style.borderColor = '';
        }
        
        // Calculate grade points for this course
        const gradePoint = gradePoints[grade];
        totalGradePointsSum += gradePoint * credits;
        totalCreditsSum += credits;
    });
    
    if (hasInvalidInput) {
        if (invalidCourseName) {
            showNotification(invalidCourseName, 'warning');
        }
        return;
    }
    
    // Calculate CGPA
    const cgpa = totalCreditsSum > 0 ? totalGradePointsSum / totalCreditsSum : 0;
    
    // Display results
    cgpaResult.textContent = cgpa.toFixed(2);
    totalGradePoints.textContent = totalGradePointsSum.toFixed(1);
    totalCredits.textContent = totalCreditsSum.toFixed(1);
    
    // Determine and display grade
    const grade = getGradeFromCGPA(cgpa);
    gradeResult.textContent = grade;
    
    // Add color coding based on CGPA
    updateResultColor(cgpa);
    
    // Show success notification
    if (courseItems.length > 0) {
        showNotification(`CGPA calculated successfully: ${cgpa.toFixed(2)}`, 'success');
    }
}

// Get letter grade from CGPA
function getGradeFromCGPA(cgpa) {
    if (cgpa >= 4.5) return 'A (Excellent)';
    if (cgpa >= 3.5) return 'B+ (Very Good)';
    if (cgpa >= 2.5) return 'B (Good)';
    if (cgpa >= 1.5) return 'C (Average)';
    if (cgpa >= 1.0) return 'D (Pass)';
    return 'F (Fail)';
}

// Update result color based on CGPA
function updateResultColor(cgpa) {
    // Remove any existing color classes
    cgpaResult.classList.remove('excellent', 'good', 'average', 'poor');
    gradeResult.classList.remove('excellent', 'good', 'average', 'poor');
    
    if (cgpa >= 4.0) {
        cgpaResult.classList.add('excellent');
        gradeResult.classList.add('excellent');
    } else if (cgpa >= 3.0) {
        cgpaResult.classList.add('good');
        gradeResult.classList.add('good');
    } else if (cgpa >= 2.0) {
        cgpaResult.classList.add('average');
        gradeResult.classList.add('average');
    } else {
        cgpaResult.classList.add('poor');
        gradeResult.classList.add('poor');
    }
}

// Open the reset confirmation modal
function openResetModal() {
    const courseCount = document.querySelectorAll('.course-item').length;
    
    // Don't show modal if there are no courses
    if (courseCount === 0) {
        showNotification('No courses to reset.', 'info');
        return;
    }
    
    resetModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close the reset confirmation modal
function closeResetModalFunc() {
    resetModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Confirm reset action
function confirmReset() {
    // Clear all courses with animation
    const courseItems = document.querySelectorAll('.course-item');
    
    // Animate removal of each course
    courseItems.forEach((course, index) => {
        setTimeout(() => {
            course.style.opacity = '0';
            course.style.transform = 'translateX(-50px)';
            
            setTimeout(() => {
                course.remove();
            }, 300);
        }, index * 100);
    });
    
    // Reset results after animation completes
    setTimeout(() => {
        // Reset results display
        cgpaResult.textContent = '0.00';
        gradeResult.textContent = '-';
        totalCourses.textContent = '0';
        totalGradePoints.textContent = '0';
        totalCredits.textContent = '0';
        
        // Reset color classes
        cgpaResult.classList.remove('excellent', 'good', 'average', 'poor');
        gradeResult.classList.remove('excellent', 'good', 'average', 'poor');
        
        // Add one course back
        addCourse();
        
        // Show reset confirmation
        showNotification('All courses and results have been reset.', 'success');
        
        // Close the modal
        closeResetModalFunc();
    }, courseItems.length * 100 + 300);
}

// Open the About modal
function openAboutModal() {
    aboutModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close the About modal
function closeAboutModal() {
    aboutModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Show notification
function showNotification(message, type) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-circle';
    if (type === 'error') icon = 'times-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Close button event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Add CSS for notifications and color coding results
const style = document.createElement('style');
style.textContent = `
    .excellent { color: #2ec4b6 !important; }
    .good { color: #4cc9f0 !important; }
    .average { color: #ff9f1c !important; }
    .poor { color: #e71d36 !important; }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        max-width: 400px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        border-left: 4px solid #2ec4b6;
    }
    
    .notification.warning {
        border-left: 4px solid #ff9f1c;
    }
    
    .notification.info {
        border-left: 4px solid #4361ee;
    }
    
    .notification.error {
        border-left: 4px solid #e71d36;
    }
    
    .notification i {
        font-size: 1.2rem;
    }
    
    .notification.success i {
        color: #2ec4b6;
    }
    
    .notification.warning i {
        color: #ff9f1c;
    }
    
    .notification.info i {
        color: #4361ee;
    }
    
    .notification.error i {
        color: #e71d36;
    }
    
    .notification span {
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: #6c757d;
        cursor: pointer;
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        color: #212529;
    }
`;
document.head.appendChild(style);
