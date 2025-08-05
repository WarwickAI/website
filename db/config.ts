import { defineDb } from 'astro:db'
import { User, Session, Account, Verification } from './auth-schema'

// https://astro.build/db/config
export default defineDb({
  tables: { User, Session, Account, Verification },
})
