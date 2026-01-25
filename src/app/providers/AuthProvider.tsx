import React from "react";
import type { Role, User } from '@/features/auth/types'

type AuthState = {
    user: User | null
    login: (role: Role) => void
    logout: () => void
}