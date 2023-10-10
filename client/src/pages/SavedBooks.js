import React, { useState } from 'react';
import {
  Container,
  Card,
  Row,
  Col
} from 'react-bootstrap';

import { getMe, deleteBook } from '../utils/API';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

import { REMOVE_BOOK } from '../utils/mutations';
import { GET_ME } from '../utils/queries';
import { useMutation, useQuery } from '@apollo/client';

// TODO: use GET_ME query instead of `getMe()`

const SavedBooks = () => {
  const [userData] = useState({});
  const [removeBook] = useMutation(REMOVE_BOOK);
  const { loading, data } = useQuery(GET_ME); // Execute GET_ME query on load
  const userData = data?.me || {}; // Save query data to userData variable

  // TODO: use this to determine if `useEffect()` hook needs to run again
  const userDataLength = Object.keys(userData).length;

  
  
  useEffect(() => {
     const getUserData = async () => {
       try {
         const token = Auth.loggedIn() ? Auth.getToken() : null;

         if (!token) {
           return false;
         }

         const response = await getMe(token);

         if (!response.ok) {
           throw new Error('something went wrong!');
         }

         const user = await response.json();
         setUserData(user);
       } catch (err) {
         console.error(err);
       }
     };

     getUserData();
   }, [userDataLength]);



  // TODO: create function that accepts the book's mongo _id value as param and deletes the book from the database
   const handleDeleteBook = async (bookId) => {
     const token = Auth.loggedIn() ? Auth.getToken() : null;

     if (!token) {
       return false;
     }

     try {
       const response = await deleteBook(bookId, token);
       const response = await removeBook({
         variables: { bookId }
       });

       if (!response.ok) {
         throw new Error('something went wrong!');
       }

       const updatedUser = await response.json();
       setUserData(updatedUser);
       
       removeBookId(bookId);
     } catch (err) {
       console.error(err);
     }

      try {
  
     const response = await removeBook({
       variables: { bookId }
    });

     if (!response.ok) {
      throw new Error('something went wrong!');
     }

     const updatedUser = await response.json();
     setUserData(updatedUser);
     removeBookId(bookId);
   } catch (err) {
     console.error(err);
   }
   };

  // if data isn't here yet, say so
  if (!userDataLength) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div fluid className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col key={book.bookId} md="4">
                <Card key={book.bookId} border='dark'>
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {/* <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button> */}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;