import React, { useEffect, useState } from 'react';
import axios from 'axios';

// API URL
const API_URL = 'http://localhost:8000/api/user';

// Helper functions for API calls
const api = {
  registerStudentByAdmin: async (user, body) => {
    try {
      const response = await axios.post(`${API_URL}/registerStudentByAdmin`, body, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error registering student by admin:', error.response || error.message);
      throw error;
    }
  },


  getStudentList: async (user) => {
    try {
      const response = await axios.get(`${API_URL}/getStudentList`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting student list:', error.response || error.message);
      throw error;
    }
  },

  getStudentById: async (user, id) => {
    try {
      const response = await axios.get(`${API_URL}/getStudentById/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting student by ID:', error.response || error.message);
      throw error;
    }
  },
  updateStudentById: async (user, id, body) => {
    try {
      const response = await axios.put(`${API_URL}/updateStudentById/${id}`, body, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating student by ID:', error.response || error.message);
      throw error;
    }
  },
  deleteStudentById: async (user, id) => {
    try {
      const response = await axios.delete(`${API_URL}/deleteStudentById/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting student by ID:', error.response || error.message);
      throw error;
    }
  },

  searchStudentByAdmin: async (user, data) => {
    try {
      const response = await axios.post(`${API_URL}/searchStudentByAdmin`, data, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching student by admin:', error.response || error.message);
      throw error;
    }
  }

};

const App = () => {
  const user = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjZkZDBlM2Q0NDVhODg0Mzk5YjVlOTUiLCJpYXQiOjE3MTg0NzI5NTF9.bRcGbpsldubP4HclvCXN_YulBMWf_dnV3OqA355qMzY' // Replace with actual token
  };

  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState({
    firstName: '', lastName: '', email: '', password: '', gender: '', phone: '', address: {
      typeOfAddress: '', city: '', state: '', pincode: '', country: ''
    }
  });
  const [studentId, setStudentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.getStudentList(user);
        setStudents(response.result); // Adjust if response structure differs
      } catch (error) {
        console.error('Error fetching students:', error.response || error.message);
      }
    };

    fetchStudents(); // Call the async function

  }, []); // Empty dependency array to run effect only once

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setStudent(prevState => ({
        ...prevState,
        [parent]: {
          ...prevState[parent],
          [child]: value
        }
      }));
    } else {
      setStudent(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (studentId) {
        await api.updateStudentById(user, studentId, student);
      } else {
        await api.registerStudentByAdmin(user, student);
      }
      setStudent({
        firstName: '', lastName: '', email: '', password: '', gender: '', phone: '', address: {
          typeOfAddress: '', city: '', state: '', pincode: '', country: ''
        }
      });
      setStudentId(null);
      const response = await api.getStudentList(user);
      setStudents(response.result);
    } catch (error) {
      console.error('Error submitting form:', error.response || error.message);
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await api.getStudentById(user, id);
      setStudent(response.result);
      setStudentId(id);
    } catch (error) {
      console.error('Error editing student:', error.response || error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteStudentById(user, id);
      setStudents(students.filter(student => student._id !== id));
    } catch (error) {
      console.error('Error deleting student:', error.response || error.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const queryString = String(searchQuery); // Convert to string if not already
      console.log('Search query:', queryString); // Log the search query

      // Prepare the request payload
      const payload = { query: queryString };
      console.log('Request payload:', payload); // Log the request payload

      // Call the API with the validated search query
      const response = await api.searchStudentByAdmin(user, student);
      console.log('API response:', response); // Log the API response

      setStudents(response.result);
    } catch (error) {
      console.error('Error searching students:', error.response || error.message);
    }
  };


  return (
    <div>
      <h1>User Management</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          value={student.firstName}
          onChange={handleChange}
          placeholder="First Name"
        />
        <input
          type="text"
          name="lastName"
          value={student.lastName}
          onChange={handleChange}
          placeholder="Last Name"
        />
        <input
          type="email"
          name="email"
          value={student.email}
          onChange={handleChange}
          placeholder="Email"

          required
        />
        <input
          type="password"
          name="password"
          value={student.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <select
          name="gender"
          value={student.gender}
          onChange={handleChange}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input
          type="phone"
          name="phone"
          value={student.phone}
          onChange={handleChange}
          placeholder="Phone"
        />
        <select
          name="address.typeOfAddress"
          value={student.address.typeOfAddress}
          onChange={handleChange}
        >
          <option value="">Select Address Type</option>
          <option value="Permanent">Permanent</option>
          <option value="Present">Present</option>
          <option value="Temporary">Temporary</option>
        </select>
        <input
          type="text"
          name="address.city"
          value={student.address.city}
          onChange={handleChange}
          placeholder="City"
        />
        <input
          type="text"
          name="address.state"
          value={student.address.state}
          onChange={handleChange}
          placeholder="State"
        />
        <input
          type="text"
          name="address.pincode"
          value={student.address.pincode}
          onChange={handleChange}
          placeholder="Pincode"
        />
        <input
          type="text"
          name="address.country"
          value={student.address.country}
          onChange={handleChange}
          placeholder="Country"
        />
        <button type="submit">{studentId ? 'Update' : 'Register'}</button>
      </form>

      <h2>Search Students</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, etc."
          required
        />
        <button type="submit">Search</button>
      </form>

      <h2>Student List</h2>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Gender</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student._id}>
              <td>{student.firstName}</td>
              <td>{student.lastName}</td>
              <td>{student.email}</td>
              <td>{student.phone}</td>
              <td>{student.gender}</td>
              <td>{student.active}</td>
              <td>
                <button onClick={() => handleEdit(student._id)}>Edit</button>
                <button onClick={() => handleDelete(student._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default App;
