
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Book, Users, GraduationCap, Github } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Book className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">SchoolVerse Nexus API</h1>
            </div>
            <a 
              href="https://github.com/ProgrammerDavid1234/schoolapiandui.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <Github className="w-5 h-5 mr-1" />
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Use the API to manage teachers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Use the API to manage students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Use the API to manage books</p>
            </CardContent>
          </Card>
        </div>

     

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6 py-4 border-b">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="rest-api">REST API</TabsTrigger>
                <TabsTrigger value="graphql-api">GraphQL API</TabsTrigger>
                <TabsTrigger value="caching">Caching</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">School Management System</h2>
                  <p className="text-gray-600 mb-4">
                    This is a comprehensive School Management System with both GraphQL and RESTful APIs for managing 
                    teachers, students, and books. It implements caching for improved performance and can be version-controlled 
                    with GitHub.
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-6 mb-2">Technology Stack</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Node.js with TypeScript</li>
                    <li>Express.js for RESTful API</li>
                    <li>Apollo Server for GraphQL</li>
                    <li>MongoDB with Mongoose</li>
                    <li>Redis for caching</li>
                  </ul>

                  <div className="mt-8 flex space-x-4">
                    <Button onClick={() => setActiveTab("rest-api")}>
                      Explore REST API
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("graphql-api")}>
                      Explore GraphQL API
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rest-api" className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">REST API Endpoints</h2>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-3">Teacher Endpoints</h3>
                  <div className="space-y-2">
                    <div className="code-block">
                      <span className="endpoint-method get">GET</span>
                      <span className="api-endpoint">/api/teachers</span>
                      <p className="text-sm text-gray-500 mt-1">Retrieve all teachers.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method get">GET</span>
                      <span className="api-endpoint">/api/teachers/:id</span>
                      <p className="text-sm text-gray-500 mt-1">Retrieve a specific teacher by ID.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method get">GET</span>
                      <span className="api-endpoint">/api/teachers/:id/students</span>
                      <p className="text-sm text-gray-500 mt-1">Retrieve all students of a teacher.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method post">POST</span>
                      <span className="api-endpoint">/api/teachers</span>
                      <p className="text-sm text-gray-500 mt-1">Create a new teacher.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method put">PUT</span>
                      <span className="api-endpoint">/api/teachers/:id</span>
                      <p className="text-sm text-gray-500 mt-1">Update a teacher by ID.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method delete">DELETE</span>
                      <span className="api-endpoint">/api/teachers/:id</span>
                      <p className="text-sm text-gray-500 mt-1">Delete a teacher by ID.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-3">Student Endpoints</h3>
                  <div className="space-y-2">
                    <div className="code-block">
                      <span className="endpoint-method get">GET</span>
                      <span className="api-endpoint">/api/students</span>
                      <p className="text-sm text-gray-500 mt-1">Retrieve all students.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method get">GET</span>
                      <span className="api-endpoint">/api/students/:id</span>
                      <p className="text-sm text-gray-500 mt-1">Retrieve a specific student by ID.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method get">GET</span>
                      <span className="api-endpoint">/api/students/:id/books</span>
                      <p className="text-sm text-gray-500 mt-1">Retrieve all books of a student.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method post">POST</span>
                      <span className="api-endpoint">/api/students</span>
                      <p className="text-sm text-gray-500 mt-1">Create a new student.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method put">PUT</span>
                      <span className="api-endpoint">/api/students/:id</span>
                      <p className="text-sm text-gray-500 mt-1">Update a student by ID.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method delete">DELETE</span>
                      <span className="api-endpoint">/api/students/:id</span>
                      <p className="text-sm text-gray-500 mt-1">Delete a student by ID.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Book Endpoints</h3>
                  <div className="space-y-2">
                    <div className="code-block">
                      <span className="endpoint-method get">GET</span>
                      <span className="api-endpoint">/api/books</span>
                      <p className="text-sm text-gray-500 mt-1">Retrieve all books.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method get">GET</span>
                      <span className="api-endpoint">/api/books/:id</span>
                      <p className="text-sm text-gray-500 mt-1">Retrieve a specific book by ID.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method post">POST</span>
                      <span className="api-endpoint">/api/books</span>
                      <p className="text-sm text-gray-500 mt-1">Create a new book.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method put">PUT</span>
                      <span className="api-endpoint">/api/books/:id</span>
                      <p className="text-sm text-gray-500 mt-1">Update a book by ID.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method delete">DELETE</span>
                      <span className="api-endpoint">/api/books/:id</span>
                      <p className="text-sm text-gray-500 mt-1">Delete a book by ID.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method post">POST</span>
                      <span className="api-endpoint">/api/books/:id/assign/:studentId</span>
                      <p className="text-sm text-gray-500 mt-1">Assign a book to a student.</p>
                    </div>
                    <div className="code-block">
                      <span className="endpoint-method post">POST</span>
                      <span className="api-endpoint">/api/books/:id/unassign</span>
                      <p className="text-sm text-gray-500 mt-1">Remove a book from a student.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="graphql-api" className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">GraphQL API</h2>
                <p className="text-gray-600 mb-6">
                  The GraphQL API is available at <span className="api-endpoint">/graphql</span>. 
                  Here are some example queries and mutations you can perform:
                </p>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Queries</h3>
                  <div className="code-block mb-4">
                    <pre>{`
# Get all teachers
query {
  teachers {
    id
    name
    email
    subject
  }
}

# Get a specific teacher with their students
query {
  teacher(id: "teacherId") {
    id
    name
    email
    students {
      id
      name
      grade
    }
  }
}

# Get all books assigned to a student
query {
  studentBooks(studentId: "studentId") {
    id
    title
    author
    genre
  }
}
                  `}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Mutations</h3>
                  <div className="code-block">
                    <pre>{`
# Create a new teacher
mutation {
  createTeacher(input: {
    name: "John Doe"
    email: "john.doe@example.com"
    subject: "Mathematics"
  }) {
    id
    name
    email
  }
}

# Create a new book and assign to student
mutation {
  createBook(input: {
    title: "The Great Gatsby"
    author: "F. Scott Fitzgerald"
    isbn: "9780743273565"
    genre: "Fiction"
    publishedYear: 1925
    studentId: "studentId"
  }) {
    id
    title
    student {
      id
      name
    }
  }
}

# Assign a book to a student
mutation {
  assignBookToStudent(
    bookId: "bookId"
    studentId: "studentId"
  ) {
    id
    title
    student {
      id
      name
    }
  }
}
                  `}</pre>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="caching" className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Caching Implementation</h2>
                <p className="text-gray-600 mb-6">
                  This system implements Redis caching to improve performance for both REST and GraphQL APIs.
                </p>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">REST API Caching</h3>
                  <p className="text-gray-600 mb-2">
                    All GET requests in the REST API are cached using an Express middleware. The cache has a TTL of 5 minutes.
                  </p>
                  <div className="code-block mb-4">
                    <pre>{`
// Example of how caching is implemented in the REST API
const cacheMiddleware = async (req, res, next) => {
  // Skip caching for non-GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const cacheKey = \`api:\${req.originalUrl}\`;
  
  try {
    const redisClient = await getRedisClient();
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      // Return cached data
      return res.status(200).json(JSON.parse(cachedData));
    }
    
    // Cache miss - continue to the actual endpoint
    next();
  } catch (error) {
    next(); // Continue without caching if Redis fails
  }
};
                  `}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">GraphQL Caching</h3>
                  <p className="text-gray-600 mb-2">
                    GraphQL queries are cached at the resolver level using Redis. Cache keys are 
                    based on the query name and parameters.
                  </p>
                  <div className="code-block">
                    <pre>{`
// Example of how caching is implemented in GraphQL resolvers
const cacheQuery = async (key, queryFn) => {
  const redisClient = await getRedisClient();
  const cachedData = await redisClient.get(key);
  
  if (cachedData) {
    // Return cached data
    return JSON.parse(cachedData);
  }
  
  // Cache miss - execute the actual query
  const result = await queryFn();
  
  // Cache the result
  await redisClient.setEx(key, CACHE_TTL, JSON.stringify(result));
  
  return result;
};

// Example usage in a resolver
books: async () => {
  return cacheQuery('graphql:books', async () => {
    return await Book.find();
  });
}
                  `}</pre>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>SchoolVerse Nexus API - A Node.js, Express, GraphQL API with MongoDB and Redis</p>
            <p className="mt-2">Built with ❤️ using Node.js, TypeScript, Express, Apollo GraphQL, MongoDB, and Redis</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
