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
    resetBtn.addEventListener('click', resetCalculator);
    aboutBtn.addEventListener('click', openAboutModal);
    closeModal.addEventListener('click', closeAboutModal);
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === aboutModal) {
            closeAboutModal();
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
        courseElement.remove();
        updateCourseCount();
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
        alert('Please add at least one course to calculate CGPA.');
        return;
    }
    
    let totalGradePointsSum = 0;
    let totalCreditsSum = 0;
    let hasInvalidInput = false;
    
    // Loop through all courses
    courseItems.forEach(course => {
        const gradeSelect = course.querySelector('.course-grade');
        const creditsInput = course.querySelector('.course-credits');
        const courseNameInput = course.querySelector('.course-name');
        
        // Validate inputs
        if (!courseNameInput.value.trim()) {
            alert('Please enter a course name for all courses.');
            courseNameInput.focus();
            hasInvalidInput = true;
            return;
        }
        
        const grade = gradeSelect.value;
        const credits = parseFloat(creditsInput.value);
        
        if (isNaN(credits) || credits <= 0) {
            alert('Please enter valid credit units (greater than 0) for all courses.');
            creditsInput.focus();
            hasInvalidInput = true;
            return;
        }
        
        // Calculate grade points for this course
        const gradePoint = gradePoints[grade];
        totalGradePointsSum += gradePoint * credits;
        totalCreditsSum += credits;
    });
    
    if (hasInvalidInput) return;
    
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

// Reset the calculator
function resetCalculator() {
    if (confirm('Are you sure you want to reset all courses and results?')) {
        // Clear all courses
        coursesList.innerHTML = '';
        
        // Reset results
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
    }
}

// Open the About modal
function openAboutModal() {
    aboutModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close the About modal
function closeAboutModal() {
    aboutModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Add CSS for color coding results
const style = document.createElement('style');
style.textContent = `
    .excellent { color: #2ec4b6 !important; }
    .good { color: #4cc9f0 !important; }
    .average { color: #ff9f1c !important; }
    .poor { color: #e71d36 !important; }
`;
document.head.appendChild(style);
