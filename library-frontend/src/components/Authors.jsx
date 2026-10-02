import { useQuery, useMutation } from '@apollo/client/react'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

const Authors = ({ show }) => {
  const { data } = useQuery(ALL_AUTHORS)
  const authors = data?.allAuthors || []

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const handleEditAuthor = (name, setBornTo) => {
    editAuthor({ variables: { name, setBornTo } })
  }

  if (!show) {
    return null
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Edit Author</h3>
      <form onSubmit={(event) => {
        event.preventDefault()
        const name = event.target.name.value
        const setBornTo = parseInt(event.target.setBornTo.value)
        handleEditAuthor(name, setBornTo)
      }}>
        <div>
          <label>
            Name:
            <select name="name">
              {authors.map((a) => (
                <option key={a.name} value={a.name}>{a.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Born:
            <input type="number" name="setBornTo" />
          </label>
        </div>
        <button type="submit">Update Author</button>
      </form>
    </div>
  )
}

export default Authors
