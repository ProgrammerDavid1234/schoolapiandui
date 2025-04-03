
import express from 'express';
import Teacher from '../models/Teacher';
import Student from '../models/Student';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import mongoose from 'mongoose';

const router = express.Router();

// Get all teachers
router.get('/', cacheMiddleware, async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single teacher
router.get('/:id', cacheMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students of a teacher
router.get('/:id/students', cacheMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('students');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher.students);
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a teacher
router.post('/', async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    
    await clearCache('api:/teachers*');
    
    res.status(201).json(teacher);
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a teacher
router.put('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    await clearCache(`api:/teachers*`);
    await clearCache(`api:/teachers/${req.params.id}*`);
    
    res.json(teacher);
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a teacher
router.delete('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Update students to remove this teacher
    await Student.updateMany(
      { teachers: req.params.id },
      { $pull: { teachers: req.params.id } }
    );
    
    await Teacher.findByIdAndDelete(req.params.id);
    
    await clearCache(`api:/teachers*`);
    await clearCache(`api:/teachers/${req.params.id}*`);
    await clearCache(`api:/students*`); // Clear student cache as well
    
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
