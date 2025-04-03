
import express from 'express';
import Book from '../models/Book';
import Student from '../models/Student';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import mongoose from 'mongoose';

const router = express.Router();

// Get all books
router.get('/', cacheMiddleware, async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single book
router.get('/:id', cacheMiddleware, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a book
router.post('/', async (req, res) => {
  try {
    const { studentId, ...bookData } = req.body;
    const book = new Book(bookData);
    
    if (studentId) {
      book.student = studentId;
      
      // Update student with this book
      await Student.findByIdAndUpdate(
        studentId,
        { $push: { books: book._id } }
      );
    }
    
    await book.save();
    
    await clearCache('api:/books*');
    if (studentId) {
      await clearCache(`api:/students/${studentId}*`);
    }
    
    res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a book
router.put('/:id', async (req, res) => {
  try {
    const { studentId, ...bookData } = req.body;
    
    // Get the current book to check if student is changing
    const currentBook = await Book.findById(req.params.id);
    
    if (!currentBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const currentStudentId = currentBook.student?.toString();
    
    if (currentStudentId !== studentId) {
      // Remove book from previous student
      if (currentStudentId) {
        await Student.findByIdAndUpdate(
          currentStudentId,
          { $pull: { books: req.params.id } }
        );
        await clearCache(`api:/students/${currentStudentId}*`);
      }
      
      // Add book to new student
      if (studentId) {
        await Student.findByIdAndUpdate(
          studentId,
          { $push: { books: req.params.id } }
        );
        await clearCache(`api:/students/${studentId}*`);
      }
      
      bookData.student = studentId || null;
    }
    
    const book = await Book.findByIdAndUpdate(req.params.id, bookData, { new: true });
    
    await clearCache(`api:/books*`);
    await clearCache(`api:/books/${req.params.id}*`);
    
    res.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    if (book.student) {
      // Remove book from student
      await Student.findByIdAndUpdate(
        book.student,
        { $pull: { books: req.params.id } }
      );
      await clearCache(`api:/students/${book.student}*`);
    }
    
    await Book.findByIdAndDelete(req.params.id);
    
    await clearCache(`api:/books*`);
    await clearCache(`api:/books/${req.params.id}*`);
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign a book to a student
router.post('/:id/assign/:studentId', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    const student = await Student.findById(req.params.studentId);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (book.student) {
      // Remove book from previous student
      await Student.findByIdAndUpdate(
        book.student,
        { $pull: { books: req.params.id } }
      );
      await clearCache(`api:/students/${book.student}*`);
    }
    
    // Update book with student
    book.student = new mongoose.Types.ObjectId(req.params.studentId);
    await book.save();
    
    // Update student with book
    student.books.push(new mongoose.Types.ObjectId(req.params.id));
    await student.save();
    
    await clearCache(`api:/books*`);
    await clearCache(`api:/books/${req.params.id}*`);
    await clearCache(`api:/students/${req.params.studentId}*`);
    
    res.json({ message: 'Book assigned to student successfully' });
  } catch (error) {
    console.error('Error assigning book to student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a book from a student
router.post('/:id/unassign', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    if (!book.student) {
      return res.status(400).json({ message: 'Book is not assigned to any student' });
    }
    
    const studentId = book.student;
    
    // Remove book from student
    await Student.findByIdAndUpdate(
      studentId,
      { $pull: { books: req.params.id } }
    );
    
    // Update book to remove student
    book.student = null;
    await book.save();
    
    await clearCache(`api:/books*`);
    await clearCache(`api:/books/${req.params.id}*`);
    await clearCache(`api:/students/${studentId}*`);
    
    res.json({ message: 'Book unassigned from student successfully' });
  } catch (error) {
    console.error('Error unassigning book from student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
