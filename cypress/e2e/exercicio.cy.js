/// <reference types="cypress" />
import { fakerDE as faker } from '@faker-js/faker';


describe('Testes da Funcionalidade Catálogo de Livros', () => {
     let token
     beforeEach(() => {
          cy.geraToken('admin@biblioteca.com', 'admin123').then(tkn => {
               token = tkn
          })
     });

     it('GET - Deve listar livros com filtros e paginação', () => {
          cy.api({
               method: 'GET',
               url: 'books',
               headers: { 'Authorization': token },
               qs: {
                    limit: 20,
                    category: 'Literatura Brasileira',
                    author: 'Machado de Assis'
               }
          }).should(response => {
               expect(response.status).to.equal(200)
               expect(response.body.pagination.limit).to.be.equal(20)
               expect(response.body.filters.category).to.be.equal('Literatura Brasileira')
               expect(response.body.filters.author).to.be.equal('Machado de Assis')
          })
     });

     it('GET - Deve obter detalhes de um livro específico', () => {
          cy.api({
               method: 'GET',
               url: 'books/2',
          }).should(response => {
               expect(response.status).to.equal(200)
               expect(response.body.book.title).to.be.equal('1984')
               expect(response.body.book.author).to.be.equal('George Orwell')
               expect(response.body.book.editor).to.be.equal('Companhia das Letras')
               expect(response.body.book.category).to.be.equal('Ficção')
          })
     });

     it('POST - Deve cadastrar um novo livro com sucesso', () => {
          let newBook = faker.book.title()
          let newAuthor = faker.book.author()
          cy.api({
               method: 'POST',
               url: 'books',
               headers: { 'Authorization': token },
               body: {
                    title: newBook,
                    author: newAuthor,
                    category: 'Ficção',
                    total_copies: '3'
               }
          }).should(response => {
               expect(response.status).to.equal(201)
               expect(response.body.message).to.equal('Livro criado com sucesso.')
          })
     });

     it('POST -  Deve rejeitar livro com dados inválidos', () => {
          let errorBook = faker.book.title()
          cy.api({
               method: 'POST',
               url: 'books',
               headers: { 'Authorization': token },
               body: {
                    title: errorBook,
                    category: 'Ficção',
                    total_copies: '3'
               },
               failOnStatusCode: false
          }).should(response => {
               expect(response.status).to.equal(400)
               expect(response.body.message).to.equal('\"author\" is required')
          })
     });

     it('PUT - Deve atualizar um livro previamente cadastrado', () => {
          let title = faker.book.title()
          let author = faker.book.author()
          let category = faker.book.genre()
          cy.cadastrarBooks(title, author, category, 2, token).then(bookId => {
               cy.api({
                    method: 'PUT',
                    url: 'books/' + bookId,
                    headers: { 'Authorization': token },
                    body: {
                         title: `${title} Alterado`,
                         author: `${author} Alterado`,
                         total_copies: 4,
                         description: 'Descrição atualizada do livro'
                    },
               }).should(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body.message).to.equal('Livro atualizado com sucesso.')
               })
          })
     });

     it('DELETE - Deve deletar um livro previamente cadastrado', () => {
          let title = faker.book.title()
          let author = faker.book.author()
          let category = faker.book.genre()
          cy.cadastrarBooks(title, author, category, 2, token).then(bookId => {
               cy.api({
                    method: 'DELETE',
                    url: 'books/' + bookId,
                    headers: { 'Authorization': token }
               }).should(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body.message).to.equal('Livro deletado com sucesso.')
               })
          })
     });
});
