

// import { Server, Socket } from 'socket.io';

// export const setupSocketIO = (io: Server) => {

//     // This will store { username: socket.id }
//     const users: Map<string, string> = new Map();

//     // This will store messages between users
//     const messages: Map<string, { from: string; message: string; timestamp: string }[]> = new Map();

//     const updateActiveUsers = () => {
//         // Emit the list of active usernames to all clients
//         io.emit('active_users', Array.from(users.keys()));
//     };

//     io.on('connection', (socket: Socket) => {
//         console.log('A user connected:', socket.id);

//         // When a user logs in with a username
//         socket.on('login', (username: string) => {
//             if (users.has(username)) {
//                 socket.emit('errorMessage', 'Username already taken');
//                 return;
//             }

//             // Register the user with their socket ID
//             users.set(username, socket.id);
//             console.log('User registered:', username);
//             updateActiveUsers(); // Emit updated user list
//         });

//         // Handle private message sending with a timestamp
//         socket.on('send_private_message', ({ toUsername, message }: { toUsername: string; message: string }) => {
//             const recipientSocketId = users.get(toUsername);
//             const senderUsername = [...users.keys()].find(key => users.get(key) === socket.id) || 'unknown';
//             const timestamp = new Date().toISOString(); // Message timestamp

//             if (recipientSocketId) {
//                 // Send the private message to the recipient
//                 io.to(recipientSocketId).emit('receive_private_message', {
//                     from: senderUsername,
//                     message,
//                     timestamp
//                 });

//                 // Store the message for both users
//                 const messageKey = [senderUsername, toUsername].sort().join(':');
//                 if (!messages.has(messageKey)) {
//                     messages.set(messageKey, []);
//                 }
//                 messages.get(messageKey)?.push({ from: senderUsername, message, timestamp });
//             } else {
//                 socket.emit('errorMessage', 'Recipient not found');
//             }
//         });

//         // Typing indicator event
//         socket.on('typing', ({ toUsername }: { toUsername: string }) => {
//             const recipientSocketId = users.get(toUsername);
//             if (recipientSocketId) {
//                 io.to(recipientSocketId).emit('user_typing', {
//                     from: [...users.keys()].find(key => users.get(key) === socket.id) || 'unknown'
//                 });
//             }
//         });

//         // Handle receiving the file from the client
//         socket.on('send_file', ({ file, fileName, fileType, caption }: { file: ArrayBuffer; fileName: string; fileType: string; caption: string }) => {
//             console.log(`Received file ${fileName} with caption "${caption}" from ${socket.id}`);

//             // Broadcast the file and caption to other connected clients
//             socket.broadcast.emit('receive_file', { file, fileName, fileType, caption, from: [...users.keys()].find(key => users.get(key) === socket.id) || 'unknown' });
//         });

        
      

//         socket.on('disconnect', () => {
//             for (const [username, id] of users.entries()) {
//                 if (id === socket.id) {
//                     users.delete(username);
//                     console.log('User disconnected:', username);
//                     updateActiveUsers(); // Emit updated user list
//                     break;
//                 }
//             }
//         });
//     });
// };

// export default setupSocketIO;
import { Server, Socket } from 'socket.io';
import { UserRepository } from '../repositories/user.repository';
import { MessageRepository } from '../repositories/message.repository';

export const setupSocketIO = (io: Server) => {
  const users: Map<string, string> = new Map();
  const messages: Map<string, { from: string; message: string; timestamp: string }[]> = new Map();

  const updateActiveUsers = async () => {
    const userRepository = new UserRepository();
    const activeUsers = await userRepository.getActiveUsers();
    io.emit('active_users', activeUsers);
  };

  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    socket.on('login', async (username: string) => {
      if (users.has(username)) {
        socket.emit('errorMessage', 'Username already taken');
        return;
      }

      users.set(username, socket.id);
      console.log('User registered:', username);

      const userRepository = new UserRepository();
      await userRepository.updateUserStatus(username, true);

      updateActiveUsers();
    });

    socket.on('send_private_message', async ({ toUsername, message }: { toUsername: string; message: string }) => {
      const recipientSocketId = users.get(toUsername);
      const senderUsername = [...users.keys()].find(key => users.get(key) === socket.id) || 'unknown';
      const timestamp = new Date().toISOString();

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive_private_message', {
          from: senderUsername,
          message,
          timestamp
        });

        const messageKey = [senderUsername, toUsername].sort().join(':');
        if (!messages.has(messageKey)) {
          messages.set(messageKey, []);
        }
        messages.get(messageKey)?.push({ from: senderUsername, message, timestamp });

        const messageRepository = new MessageRepository();
        await messageRepository.save({ from: senderUsername, to: toUsername, message, timestamp: new Date() });
      } else {
        socket.emit('errorMessage', 'Recipient not found');
      }
    });

    socket.on('typing', ({ toUsername }: { toUsername: string }) => {
      const recipientSocketId = users.get(toUsername);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_typing', {
          from: [...users.keys()].find(key => users.get(key) === socket.id) || 'unknown'
        });
      }
    });

    socket.on('send_file', ({ file, fileName, fileType, caption }: { file: ArrayBuffer; fileName: string; fileType: string; caption: string }) => {
      console.log(`Received file ${fileName} with caption "${caption}" from ${socket.id}`);
      socket.broadcast.emit('receive_file', { file, fileName, fileType, caption, from: [...users.keys()].find(key => users.get(key) === socket.id) || 'unknown' });
    });

    socket.on('disconnect', async () => {
      for (const [username, id] of users.entries()) {
        if (id === socket.id) {
          users.delete(username);
          console.log('User disconnected:', username);

          const userRepository = new UserRepository();
          await userRepository.updateUserStatus(username, false);

          updateActiveUsers();
          break;
        }
      }
    });
  });
};

export default setupSocketIO;
