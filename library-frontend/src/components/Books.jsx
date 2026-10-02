import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS } from '../queries'
import { useState } from 'react'

const Books = ({ show }) => {
  const [genreFilter, setGenreFilter] = useState(null)

  const { data } = useQuery(ALL_BOOKS, {
    variables: { genre: genreFilter },
  })

  const { data: allBooksData } = useQuery(ALL_BOOKS)

  const books = data?.allBooks || []
  const allBooks = allBooksData?.allBooks || []

  const genres = Array.from(new Set(allBooks.flatMap((book) => book.genres)))
  
  if (!show) {
    return null
  }

  return (
    <div>
      <h2>books</h2>
      <div>
        <button onClick={() => setGenreFilter(null)}>all genres</button>
        {genres.map((genre) => (
          <button key={genre} value={genre} onClick={() => setGenreFilter(genre)}>
            {genre}
          </button>
        ))}
      </div>
      <p>in genre <strong>{genreFilter || 'all genres'}</strong></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  )
}

export default Books
