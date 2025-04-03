
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Teacher {
    id: ID!
    name: String!
    email: String!
    subject: String!
    students: [Student]
    createdAt: String
    updatedAt: String
  }

  type Student {
    id: ID!
    name: String!
    email: String!
    grade: String!
    teachers: [Teacher]
    books: [Book]
    createdAt: String
    updatedAt: String
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    isbn: String!
    genre: String!
    publishedYear: Int!
    student: Student
    createdAt: String
    updatedAt: String
  }

  type Query {
    teachers: [Teacher]
    teacher(id: ID!): Teacher
    teacherStudents(teacherId: ID!): [Student]
    
    students: [Student]
    student(id: ID!): Student
    studentBooks(studentId: ID!): [Book]
    
    books: [Book]
    book(id: ID!): Book
  }

  input TeacherInput {
    name: String!
    email: String!
    subject: String!
  }

  input StudentInput {
    name: String!
    email: String!
    grade: String!
    teacherIds: [ID]
  }

  input BookInput {
    title: String!
    author: String!
    isbn: String!
    genre: String!
    publishedYear: Int!
    studentId: ID
  }

  type Mutation {
    createTeacher(input: TeacherInput!): Teacher
    updateTeacher(id: ID!, input: TeacherInput!): Teacher
    deleteTeacher(id: ID!): Boolean
    
    createStudent(input: StudentInput!): Student
    updateStudent(id: ID!, input: StudentInput!): Student
    deleteStudent(id: ID!): Boolean
    
    createBook(input: BookInput!): Book
    updateBook(id: ID!, input: BookInput!): Book
    deleteBook(id: ID!): Boolean
    
    assignBookToStudent(bookId: ID!, studentId: ID!): Book
    removeBookFromStudent(bookId: ID!): Book
  }
`;
