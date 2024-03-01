'use-strict'

const userTypes = {
    CLIENT: 'CLIENT',
    CUSTOMER: 'CUSTOMER',
    EMPLOYEE: 'EMPLOYEE',
    SUPERADMIN: 'SA'
}
const accessLevel = {
    CREATE: 'create',
    MODIFY: 'modify',
    READ: 'read',
    DELETE: 'delete',
}

const roles = {
    SUPERADMIN: 'superadmin',
    // UNPAID: 'unpaid',
    // PAID: 'paid',
    CLIENT: 'client',
    GM: 'gm',
    CUSTOMER: 'customer'
}


module.exports = {

    roles,
    accessLevel,
    userTypes,
}
