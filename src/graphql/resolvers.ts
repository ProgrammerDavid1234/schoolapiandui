
import Teacher from '../models/Teacher';
import Student from '../models/Student';
import Book from '../models/Book';
import { getRedisClient } from '../services/redisClient';
import mongoose from 'mongoose';

const CACHE_TTL = 300; // 5 minutes in seconds

// Helper function to cache query results
const cacheQuery = async (key: string, queryFn: () => Promise<any>) => {
  const redisClient = await getRedisClient();
  const cachedData = await redisClient.get(key);
  
  if (cachedData) {
    console.log(`Cache hit for ${key}`);
    return JSON.parse(cachedData);
  }
  
  const result = await queryFn();
  await redisClient.setEx(key, CACHE_TTL, JSON.stringify(result));
  console.log(`Cached result for ${key}`);
  
  return result;
};

// Helper function to clear cache by pattern
const clearCacheByPattern = async (pattern: string) => {
  const redisClient = await getRedisClient();
  const keys = await redisClient.keys(pattern);
  
  if (keys.length > 0) {
    await redisClient.del(keys);
    console.log(`Cleared ${keys.length} cache keys matching pattern: ${pattern}`);
  }
};

export const resolvers = {
  Query: {
    teachers: async () => {
      return cacheQuery('graphql:teachers', async () => {
        return await Teacher.find();
      });
    },
    
    teacher: async (_: any, { id }: { id: string }) => {
      return cacheQuery(`graphql:teacher:${id}`, async () => {
        return await Teacher.findById(id);
      });
    },
    
    teacherStudents: async (_: any, { teacherId }: { teacherId: string }) => {
      return cacheQuery(`graphql:teacher:${teacherId}:students`, async () => {
        const teacher = await Teacher.findById(teacherId).populate('students');
        return teacher?.students || [];
      });
    },
    
    students: async () => {
      return cacheQuery('graphql:students', async () => {
        return await Student.find();
      });
    },
    
    student: async (_: any, { id }: { id: string }) => {
      return cacheQuery(`graphql:student:${id}`, async () => {
        return await Student.findById(id);
      });
    },
    
    studentBooks: async (_: any, { studentId }: { studentId: string }) => {
      return cacheQuery(`graphql:student:${studentId}:books`, async () => {
        const student = await Student.findById(studentId).populate('books');
        return student?.books || [];
      });
    },
    
    books: async () => {
      return cacheQuery('graphql:books', async () => {
        return await Book.find();
      });
    },
    
    book: async (_: any, { id }: { id: string }) => {
      return cacheQuery(`graphql:book:${id}`, async () => {
        return await Book.findById(id);
      });
    }
  },
  
  Mutation: {
    createTeacher: async (_: any, { input }: { input: any }) => {
      const newTeacher = new Teacher(input);
      await newTeacher.save();
      await clearCacheByPattern('graphql:teachers*');
      return newTeacher;
    },
    
    updateTeacher: async (_: any, { id, input }: { id: string, input: any }) => {
      const updatedTeacher = await Teacher.findByIdAndUpdate(id, input, { new: true });
      await clearCacheByPattern(`graphql:teacher:${id}*`);
      await clearCacheByPattern('graphql:teachers*');
      return updatedTeacher;
    },
    
    deleteTeacher: async (_: any, { id }: { id: string }) => {
      await Teacher.findByIdAndDelete(id);
      await clearCacheByPattern(`graphql:teacher:${id}*`);
      await clearCacheByPattern('graphql:teachers*');
      return true;
    },
    
    createStudent: async (_: any, { input }: { input: any }) => {
      const { teacherIds, ...studentData } = input;
      const newStudent = new Student(studentData);
      
      if (teacherIds && teacherIds.length > 0) {
        newStudent.teachers = teacherIds;
        
        // Update teachers with this student
        await Teacher.updateMany(
          { _id: { $in: teacherIds } },
          { $push: { students: newStudent._id } }
        );
      }
      
      await newStudent.save();
      await clearCacheByPattern('graphql:students*');
      await clearCacheByPattern('graphql:teachers*');
      return newStudent;
    },
    
    updateStudent: async (_: any, { id, input }: { id: string, input: any }) => {
      const { teacherIds, ...studentData } = input;
      
      if (teacherIds) {
        // Remove student from previous teachers
        await Teacher.updateMany(
          { students: id },
          { $pull: { students: id } }
        );
        
        // Add student to new teachers
        await Teacher.updateMany(
          { _id: { $in: teacherIds } },
          { $push: { students: id } }
        );
        
        studentData.teachers = teacherIds;
      }
      
      const updatedStudent = await Student.findByIdAndUpdate(id, studentData, { new: true });
      
      await clearCacheByPattern(`graphql:student:${id}*`);
      await clearCacheByPattern('graphql:students*');
      await clearCacheByPattern('graphql:teachers*');
      
      return updatedStudent;
    },
    
    deleteStudent: async (_: any, { id }: { id: string }) => {
      // Remove student from teachers
      await Teacher.updateMany(
        { students: id },
        { $pull: { students: id } }
      );
      
      // Set books' student to null
      await Book.updateMany(
        { student: id },
        { $set: { student: null } }
      );
      
      await Student.findByIdAndDelete(id);
      
      await clearCacheByPattern(`graphql:student:${id}*`);
      await clearCacheByPattern('graphql:students*');
      await clearCacheByPattern('graphql:books*');
      await clearCacheByPattern('graphql:teachers*');
      
      return true;
    },
    
    createBook: async (_: any, { input }: { input: any }) => {
      const { studentId, ...bookData } = input;
      
      const newBook = new Book(bookData);
      
      if (studentId) {
        newBook.student = studentId;
        
        // Update student with this book
        await Student.findByIdAndUpdate(
          studentId,
          { $push: { books: newBook._id } }
        );
      }
      
      await newBook.save();
      
      await clearCacheByPattern('graphql:books*');
      if (studentId) {
        await clearCacheByPattern(`graphql:student:${studentId}*`);
      }
      
      return newBook;
    },
    
    updateBook: async (_: any, { id, input }: { id: string, input: any }) => {
      const { studentId, ...bookData } = input;
      
      // Get the current book to check if student is changing
      const currentBook = await Book.findById(id);
      const currentStudentId = currentBook?.student?.toString();
      
      if (currentStudentId !== studentId) {
        // Remove book from previous student
        if (currentStudentId) {
          await Student.findByIdAndUpdate(
            currentStudentId,
            { $pull: { books: id } }
          );
          await clearCacheByPattern(`graphql:student:${currentStudentId}*`);
        }
        
        // Add book to new student
        if (studentId) {
          await Student.findByIdAndUpdate(
            studentId,
            { $push: { books: id } }
          );
          await clearCacheByPattern(`graphql:student:${studentId}*`);
        }
        
        bookData.student = studentId || null;
      }
      
      const updatedBook = await Book.findByIdAndUpdate(id, bookData, { new: true });
      
      await clearCacheByPattern(`graphql:book:${id}*`);
      await clearCacheByPattern('graphql:books*');
      
      return updatedBook;
    },
    
    deleteBook: async (_: any, { id }: { id: string }) => {
      const book = await Book.findById(id);
      
      if (book?.student) {
        // Remove book from student
        await Student.findByIdAndUpdate(
          book.student,
          { $pull: { books: id } }
        );
        await clearCacheByPattern(`graphql:student:${book.student}*`);
      }
      
      await Book.findByIdAndDelete(id);
      
      await clearCacheByPattern(`graphql:book:${id}*`);
      await clearCacheByPattern('graphql:books*');
      
      return true;
    },
    
    assignBookToStudent: async (_: any, { bookId, studentId }: { bookId: string, studentId: string }) => {
      const book = await Book.findById(bookId);
      
      if (book?.student) {
        // Remove book from previous student
        await Student.findByIdAndUpdate(
          book.student,
          { $pull: { books: bookId } }
        );
        await clearCacheByPattern(`graphql:student:${book.student}*`);
      }
      
      // Add book to new student
      await Student.findByIdAndUpdate(
        studentId,
        { $push: { books: bookId } }
      );
      
      const updatedBook = await Book.findByIdAndUpdate(
        bookId,
        { student: studentId },
        { new: true }
      );
      
      await clearCacheByPattern(`graphql:book:${bookId}*`);
      await clearCacheByPattern(`graphql:student:${studentId}*`);
      await clearCacheByPattern('graphql:books*');
      
      return updatedBook;
    },
    
    removeBookFromStudent: async (_: any, { bookId }: { bookId: string }) => {
      const book = await Book.findById(bookId);
      
      if (book?.student) {
        // Remove book from student
        await Student.findByIdAndUpdate(
          book.student,
          { $pull: { books: bookId } }
        );
        await clearCacheByPattern(`graphql:student:${book.student}*`);
      }
      
      const updatedBook = await Book.findByIdAndUpdate(
        bookId,
        { student: null },
        { new: true }
      );
      
      await clearCacheByPattern(`graphql:book:${bookId}*`);
      await clearCacheByPattern('graphql:books*');
      
      return updatedBook;
    }
  },
  
  Teacher: {
    students: async (teacher: any) => {
      if (teacher.students && teacher.students.length > 0) {
        return cacheQuery(`graphql:teacher:${teacher.id}:populated:students`, async () => {
          return await Student.find({ _id: { $in: teacher.students } });
        });
      }
      return [];
    }
  },
  
  Student: {
    teachers: async (student: any) => {
      if (student.teachers && student.teachers.length > 0) {
        return cacheQuery(`graphql:student:${student.id}:populated:teachers`, async () => {
          return await Teacher.find({ _id: { $in: student.teachers } });
        });
      }
      return [];
    },
    
    books: async (student: any) => {
      if (student.books && student.books.length > 0) {
        return cacheQuery(`graphql:student:${student.id}:populated:books`, async () => {
          return await Book.find({ _id: { $in: student.books } });
        });
      }
      return [];
    }
  },
  
  Book: {
    student: async (book: any) => {
      if (book.student) {
        return cacheQuery(`graphql:book:${book.id}:populated:student`, async () => {
          return await Student.findById(book.student);
        });
      }
      return null;
    }
  }
};
