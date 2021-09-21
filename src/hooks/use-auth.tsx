import { AuthContext } from '@app/providers/Auth'
import { useContext } from 'react'

export const useAuth = () => {
  return useContext(AuthContext)
}