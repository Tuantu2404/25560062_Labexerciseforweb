const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.connect('mongodb://localhost:27017/blog_db')
.then(() => console.log('Connected to MongoDB'))
.catch(err=> console.error('Could not connnect to MongoDB', err));

const studentSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }] 
});

const courseSchema = new Schema({
    title: {type: String, required: true},
    code: {type: String, required: true, unique: true},
    maxStudents: {type: Number, required: true},
    availableSlots: {type: Number, required: true},
    students: [{ type: Schema.Types.ObjectId, ref: 'Student'}]
});

const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);

async function EnrollCourse(studentId, courseId){
const student = await Student.findById(studentId);
const course = await Course.findById(courseId);
 if (!student || !course) {
    throw new Error('Student or Course not found');
}
 const isenrolled = student.courses.includes(courseId);
 if (isenrolled) {
    throw new Error('Student is already enrolled in this course');
 }
 if (course.availableSlots <= 0){
    throw new Error('No available slots in this course');
 }
 student.courses.push(courseId);
 course.students.push(studentId);
 course.availableSlots -= 1;
 await student.save();
 await course.save();
 return {student, course};
}
async function dropCourse(studentId, courseId){
 const student = await Student.findById(studentId);
 const course = await Course.findById(courseId);
  if (!student || !course){
    throw new Error('Student or Course not found');
  }
  const isEnrolled = student.courses.some(id => id.toString() === courseId.toString());
  if (!isEnrolled){
    throw new Error('Student is not enrolled in this course so cannot drop it');
  }
  student.courses = student.courses.filter(id => id.toString() !== courseId.toString());
  course.students = course.students.filter(id => id.toString() !== studentId.toString());

  course.availableSlots += 1;
  await student.save();
  await course.save();
  return {student, course};
}

 async function runTask1() {
  try {
    // Thay 2 chuỗi ID bên dưới bằng ID thật bạn vừa copy từ Compass
    const studentId = '6ac99959d1bf761a8a8f18ef';
    const courseId = '6ac99959d1bf761a8a8f18f1';

    const result = await dropCourse(studentId, courseId);
    console.log('Drop successfully!');
    
  } catch (error) {
    console.error('Lỗi:', error.message);
  } finally {
    mongoose.connection.close(); // Đóng kết nối sau khi chạy xong
  }
}

runTask1();