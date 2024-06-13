// Импортируем необходимые зависимости
'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useUser } from './context/UserContext'; // Импортируем хук useUser

interface User {
  _id: string;
  email: string;
  city:string;
}

const HomePage = () => {
  const { email } = useUser(); // Получаем данные о пользователе из контекста

  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, []);

  const handleChatOpen = (userId: string) => {
    router.push(`/chats/${userId}`);
  };

  // Фильтрация пользователей, исключая текущего пользователя
  const filteredUsers = users.filter(user => user.email !== email);

  return (
    <div>
      <h1 className='text-black'>Users</h1>
      <ul className='text-black'>
        {filteredUsers.map((user) => (
          <li key={user._id}>
            {user.email} - {user.city}
            <button onClick={() => handleChatOpen(user._id)}>Chat</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
