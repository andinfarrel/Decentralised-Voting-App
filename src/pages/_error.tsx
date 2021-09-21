import { NextPage } from 'next'

const statusCodes: { [code: number]: string } = {
  400: 'Bad Request',
  404: 'This page could not be found',
  405: 'Method Not Allowed',
  500: 'Internal Server Error',
  503: 'Maintenance Mode'
}

const ErrorPage: NextPage<{
  statusCode: number
}> = ({
  statusCode
}) => {
  return (
    <main>
      <p className="text-4xl">An Error has occured</p>
      <p className="text-2xl">Error {statusCode}</p>
    </main>
  )
}

export default ErrorPage