
import express from 'express';
import Student from '../models/Student';
import Teacher from '../models/Teacher';
import Book from '../models/Book';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import mongoose from 'mongoose';

const router = express.Router();

// Get all students
router.get('/', cacheMiddleware, async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single student
router.get('/:id', cacheMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all books of a student
router.get('/:id/books', cacheMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('books');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student.books);
  } catch (error) {
    console.error('Error fetching student books:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all teachers of a student
router.get('/:id/teachers', cacheMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('teachers');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student.teachers);
  } catch (error) {
    console.error('Error fetching student teachers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a student
router.post('/', async (req, res) => {
  try {
    const { teacherIds, ...studentData } = req.body;
    const student = new Student(studentData);
    
    if (teacherIds && teacherIds.length > 0) {
      student.teachers = teacherIds;
      
      // Update teachers with this student
      await Teacher.updateMany(
        { _id: { $in: teacherIds } },
        { $push: { students: student._id } }
      );
    }
    
    await student.save();
    
    await clearCache('api:/students*');
    await clearCache('api:/teachers*');
    
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a student
router.put('/:id', async (req, res) => {
  try {
    const { teacherIds, ...studentData } = req.body;
    
    if (teacherIds) {
      // Remove student from previous teachers
      await Teacher.updateMany(
        { students: req.params.id },
        { $pull: { students: req.params.id } }
      );
      
      // Add student to new teachers
      await Teacher.updateMany(
        { _id: { $in: teacherIds } },
        { $push: { students: req.params.id } }
      );
      
      studentData.teachers = teacherIds;
    }
    
    const student = await Student.findByIdAndUpdate(req.params.id, studentData, { new: true });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await clearCache(`api:/students*`);
    await clearCache(`api:/students/${req.params.id}*`);
    await clearCache(`api:/teachers*`);
    
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Remove student from teachers
    await Teacher.updateMany(
      { students: req.params.id },
      { $pull: { students: req.params.id } }
    );
    
    // Set books' student to null
    await Book.updateMany(
      { student: req.params.id },
      { $set: { student: null } }
    );
    
    await Student.findByIdAndDelete(req.params.id);
    
    await clearCache(`api:/students*`);
    await clearCache(`api:/students/${req.params.id}*`);
    await clearCache(`api:/teachers*`);
    await clearCache(`api:/books*`);
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign a teacher to a student
router.post('/:id/teachers/:teacherId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const teacher = await Teacher.findById(req.params.teacherId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Check if the teacher is already assigned to the student
    if (student.teachers.includes(new mongoose.Types.ObjectId(req.params.teacherId))) {
      return res.status(400).json({ message: 'Teacher is already assigned to this student' });
    }
    
    // Update student with teacher
    student.teachers.push(new mongoose.Types.ObjectId(req.params.teacherId));
    await student.save();
    
    // Update teacher with student
    teacher.students.push(new mongoose.Types.ObjectId(req.params.id));
    await teacher.save();
    
    await clearCache(`api:/students*`);
    await clearCache(`api:/students/${req.params.id}*`);
    await clearCache(`api:/teachers*`);
    await clearCache(`api:/teachers/${req.params.teacherId}*`);
    
    res.json({ message: 'Teacher assigned to student successfully' });
  } catch (error) {
    console.error('Error assigning teacher to student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a teacher from a student
router.delete('/:id/teachers/:teacherId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const teacher = await Teacher.findById(req.params.teacherId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Remove teacher from student
    student.teachers = student.teachers.filter(
      (teacherId) => teacherId.toString() !== req.params.teacherId
    );
    await student.save();
    
    // Remove student from teacher
    teacher.students = teacher.students.filter(
      (studentId) => studentId.toString() !== req.params.id
    );
    await teacher.save();
    
    await clearCache(`api:/students*`);
    await clearCache(`api:/students/${req.params.id}*`);
    await clearCache(`api:/teachers*`);
    await clearCache(`api:/teachers/${req.params.teacherId}*`);
    
    res.json({ message: 'Teacher removed from student successfully' });
  } catch (error) {
    console.error('Error removing teacher from student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
