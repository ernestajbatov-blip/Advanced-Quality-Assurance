// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { fetchUsers, createUser, deleteUser, updateUser } from '../../axios/wellService';

const AdminUsers = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    login: '',
    name: '',
    password: '',
    is_admin: false,
    available_ngdu_id: ''
  });
  const [editUser, setEditUser] = useState({
    login: '',
    name: '',
    password: '',
    is_admin: false,
    available_ngdu_id: ''
  });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetchUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.login || !newUser.name || !newUser.password) {
      setError('Заполните все обязательные поля');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const response = await createUser(newUser);
      setUsers([...users, response.data]);
      setNewUser({
        login: '',
        name: '',
        password: '',
        is_admin: false,
        available_ngdu_id: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Ошибка создания пользователя');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditUser({
      login: user.login,
      name: user.name,
      password: '',
      is_admin: user.is_admin,
      available_ngdu_id: user.available_ngdu_id || ''
    });
    setError('');
  };

  const handleUpdateUser = async () => {
    if (!editUser.login || !editUser.name) {
      setError('Заполните все обязательные поля');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      const updateData = {
        login: editUser.login,
        name: editUser.name,
        is_admin: editUser.is_admin,
        available_ngdu_id: editUser.available_ngdu_id
      };

      // Only include password if it's provided
      if (editUser.password.trim()) {
        updateData.password = editUser.password;
      }

      const response = await updateUser(editingUser, updateData);
      setUsers(users.map(user => 
        user.id === editingUser ? { ...user, ...response.data } : user
      ));
      setEditingUser(null);
      setEditUser({
        login: '',
        name: '',
        password: '',
        is_admin: false,
        available_ngdu_id: ''
      });
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Ошибка обновления пользователя');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      await deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Ошибка удаления пользователя');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser({
      ...newUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUser({
      ...editUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditUser({
      login: '',
      name: '',
      password: '',
      is_admin: false,
      available_ngdu_id: ''
    });
    setError('');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1f',
        color: '#ffffff'
      }}>
        Загрузка...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1f',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '28px',
            margin: 0
          }}>
            Управление пользователями
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showCreateForm ? 'Отмена' : 'Создать пользователя'}
            </button>
            <button
              onClick={onBack}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Назад
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#dc3545',
            color: '#ffffff',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {showCreateForm && (
          <div style={{
            backgroundColor: '#2d2d32',
            padding: '30px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h3 style={{
              color: '#ffffff',
              marginBottom: '20px',
              fontSize: '20px'
            }}>
              Создать нового пользователя
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#ffffff',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  Логин *
                </label>
                <input
                  type="text"
                  name="login"
                  value={newUser.login}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #555',
                    backgroundColor: '#1a1a1f',
                    color: '#ffffff',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Введите логин"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#ffffff',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  Имя *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #555',
                    backgroundColor: '#1a1a1f',
                    color: '#ffffff',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Введите имя"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#ffffff',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  Пароль *
                </label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #555',
                    backgroundColor: '#1a1a1f',
                    color: '#ffffff',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Введите пароль"
                />
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <input
                type="checkbox"
                name="is_admin"
                checked={newUser.is_admin}
                onChange={handleInputChange}
                style={{ marginRight: '8px' }}
              />
              <label style={{
                color: '#ffffff',
                fontSize: '14px'
              }}>
                Администратор
              </label>
            </div>

            <div style={{
              marginTop: '30px',
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                style={{
                  padding: '12px 24px',
                  backgroundColor: creating ? '#666' : '#28a745',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {creating ? 'Создание...' : 'Создать'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        <div style={{
          backgroundColor: '#2d2d32',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#1a1a1f' }}>
                <th style={{ padding: '15px', textAlign: 'left', color: '#ffffff', fontSize: '14px' }}>ID</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#ffffff', fontSize: '14px' }}>Логин</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#ffffff', fontSize: '14px' }}>Имя</th>
                <th style={{ padding: '15px', textAlign: 'center', color: '#ffffff', fontSize: '14px' }}>Админ</th>
                <th style={{ padding: '15px', textAlign: 'center', color: '#ffffff', fontSize: '14px' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <React.Fragment key={user.id}>
                  <tr style={{
                    backgroundColor: index % 2 === 0 ? '#2d2d32' : '#353540',
                    borderBottom: '1px solid #555'
                  }}>
                    <td style={{ padding: '15px', color: '#ffffff', fontSize: '14px' }}>{user.id}</td>
                    <td style={{ padding: '15px', color: '#ffffff', fontSize: '14px' }}>{user.login}</td>
                    <td style={{ padding: '15px', color: '#ffffff', fontSize: '14px' }}>{user.name}</td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#ffffff', fontSize: '14px' }}>
                      {user.is_admin ? '✓' : ''}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditUser(user)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#007bff',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {editingUser === user.id && (
                    <tr>
                      <td colSpan="5" style={{ padding: '0', backgroundColor: '#1a1a1f' }}>
                        <div style={{ padding: '20px' }}>
                          <h4 style={{ color: '#ffffff', marginBottom: '15px', fontSize: '16px' }}>
                            Редактировать пользователя
                          </h4>
                          
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '15px',
                            marginBottom: '15px'
                          }}>
                            <div>
                              <label style={{
                                display: 'block',
                                color: '#ffffff',
                                marginBottom: '5px',
                                fontSize: '12px'
                              }}>
                                Логин *
                              </label>
                              <input
                                type="text"
                                name="login"
                                value={editUser.login}
                                onChange={handleEditInputChange}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  borderRadius: '4px',
                                  border: '1px solid #555',
                                  backgroundColor: '#2d2d32',
                                  color: '#ffffff',
                                  fontSize: '12px',
                                  boxSizing: 'border-box'
                                }}
                              />
                            </div>

                            <div>
                              <label style={{
                                display: 'block',
                                color: '#ffffff',
                                marginBottom: '5px',
                                fontSize: '12px'
                              }}>
                                Имя *
                              </label>
                              <input
                                type="text"
                                name="name"
                                value={editUser.name}
                                onChange={handleEditInputChange}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  borderRadius: '4px',
                                  border: '1px solid #555',
                                  backgroundColor: '#2d2d32',
                                  color: '#ffffff',
                                  fontSize: '12px',
                                  boxSizing: 'border-box'
                                }}
                              />
                            </div>

                            <div>
                              <label style={{
                                display: 'block',
                                color: '#ffffff',
                                marginBottom: '5px',
                                fontSize: '12px'
                              }}>
                                Новый пароль (оставьте пустым, чтобы не менять)
                              </label>
                              <input
                                type="password"
                                name="password"
                                value={editUser.password}
                                onChange={handleEditInputChange}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  borderRadius: '4px',
                                  border: '1px solid #555',
                                  backgroundColor: '#2d2d32',
                                  color: '#ffffff',
                                  fontSize: '12px',
                                  boxSizing: 'border-box'
                                }}
                                placeholder="Новый пароль"
                              />
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '15px'
                          }}>
                            <input
                              type="checkbox"
                              name="is_admin"
                              checked={editUser.is_admin}
                              onChange={handleEditInputChange}
                              style={{ marginRight: '8px' }}
                            />
                            <label style={{
                              color: '#ffffff',
                              fontSize: '12px'
                            }}>
                              Администратор
                            </label>
                          </div>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={handleUpdateUser}
                              disabled={updating}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: updating ? '#666' : '#28a745',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: updating ? 'not-allowed' : 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              {updating ? 'Обновление...' : 'Сохранить'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#6c757d',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;