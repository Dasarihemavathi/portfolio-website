const storageKey = "simple-student-management-system.students";

const starterStudents = [
  {
    id: crypto.randomUUID(),
    name: "Ananya Rao",
    rollNumber: "STU-101",
    course: "Computer Science",
    grade: 91,
    email: "ananya.rao@example.com",
  },
  {
    id: crypto.randomUUID(),
    name: "Rahul Mehta",
    rollNumber: "STU-102",
    course: "Mathematics",
    grade: 84,
    email: "rahul.mehta@example.com",
  },
  {
    id: crypto.randomUUID(),
    name: "Priya Sharma",
    rollNumber: "STU-103",
    course: "Physics",
    grade: 88,
    email: "priya.sharma@example.com",
  },
];

const form = document.querySelector("#studentForm");
const studentId = document.querySelector("#studentId");
const studentName = document.querySelector("#studentName");
const rollNumber = document.querySelector("#rollNumber");
const course = document.querySelector("#course");
const grade = document.querySelector("#grade");
const email = document.querySelector("#email");
const tableBody = document.querySelector("#studentTableBody");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const resetButton = document.querySelector("#resetButton");
const submitButton = document.querySelector("#submitButton");
const formTitle = document.querySelector("#formTitle");
const totalStudents = document.querySelector("#totalStudents");
const averageGrade = document.querySelector("#averageGrade");
const activeCourses = document.querySelector("#activeCourses");

let students = loadStudents();

function loadStudents() {
  const stored = localStorage.getItem(storageKey);
  return stored ? JSON.parse(stored) : starterStudents;
}

function saveStudents() {
  localStorage.setItem(storageKey, JSON.stringify(students));
}

function renderStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleStudents = students.filter((student) => {
    return [student.name, student.rollNumber, student.course]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  tableBody.innerHTML = visibleStudents
    .map(
      (student) => `
        <tr>
          <td>${escapeHtml(student.name)}</td>
          <td>${escapeHtml(student.rollNumber)}</td>
          <td>${escapeHtml(student.course)}</td>
          <td><span class="grade-badge">${student.grade}</span></td>
          <td>${escapeHtml(student.email)}</td>
          <td>
            <div class="actions">
              <button class="action-button" data-action="edit" data-id="${student.id}">Edit</button>
              <button class="action-button delete" data-action="delete" data-id="${student.id}">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  emptyState.hidden = visibleStudents.length > 0;
  updateSummary();
}

function updateSummary() {
  const total = students.length;
  const gradeTotal = students.reduce((sum, student) => sum + Number(student.grade), 0);
  const courses = new Set(students.map((student) => student.course.trim().toLowerCase()));

  totalStudents.textContent = total;
  averageGrade.textContent = total ? Math.round(gradeTotal / total) : 0;
  activeCourses.textContent = courses.size;
}

function resetForm() {
  form.reset();
  studentId.value = "";
  formTitle.textContent = "Add Student";
  submitButton.textContent = "Add Student";
  studentName.focus();
}

function handleSubmit(event) {
  event.preventDefault();

  const student = {
    id: studentId.value || crypto.randomUUID(),
    name: studentName.value.trim(),
    rollNumber: rollNumber.value.trim(),
    course: course.value.trim(),
    grade: Number(grade.value),
    email: email.value.trim(),
  };

  if (!Number.isInteger(student.grade) || student.grade < 0 || student.grade > 100) {
    grade.setCustomValidity("Grade must be a whole number from 0 to 100.");
    grade.reportValidity();
    return;
  }

  grade.setCustomValidity("");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    email.setCustomValidity("Enter a valid email address.");
    email.reportValidity();
    return;
  }

  email.setCustomValidity("");

  const duplicateRollNumber = students.some(
    (existingStudent) =>
      existingStudent.rollNumber.toLowerCase() === student.rollNumber.toLowerCase() &&
      existingStudent.id !== student.id
  );

  if (duplicateRollNumber) {
    rollNumber.setCustomValidity("Roll number already exists.");
    rollNumber.reportValidity();
    return;
  }

  rollNumber.setCustomValidity("");

  if (studentId.value) {
    students = students.map((existingStudent) =>
      existingStudent.id === student.id ? student : existingStudent
    );
  } else {
    students.push(student);
  }

  saveStudents();
  renderStudents();
  resetForm();
}

function editStudent(id) {
  const student = students.find((currentStudent) => currentStudent.id === id);
  if (!student) return;

  studentId.value = student.id;
  studentName.value = student.name;
  rollNumber.value = student.rollNumber;
  course.value = student.course;
  grade.value = student.grade;
  email.value = student.email;
  formTitle.textContent = "Edit Student";
  submitButton.textContent = "Update Student";
  studentName.focus();
}

function deleteStudent(id) {
  const student = students.find((currentStudent) => currentStudent.id === id);
  if (!student) return;

  const confirmed = confirm(`Delete ${student.name}'s record?`);
  if (!confirmed) return;

  students = students.filter((currentStudent) => currentStudent.id !== id);
  saveStudents();
  renderStudents();

  if (studentId.value === id) {
    resetForm();
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

form.addEventListener("submit", handleSubmit);
resetButton.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderStudents);

tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "edit") {
    editStudent(button.dataset.id);
  }

  if (button.dataset.action === "delete") {
    deleteStudent(button.dataset.id);
  }
});

renderStudents();
