export type Role = 'clerk' | 'staff' | 'boss'

export type User = {
    id: string
    name: string
    role: Role
}