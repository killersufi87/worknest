"use server"

import { revalidatePath } from "next/cache"
import { getAdminContext } from "@/lib/auth/admin"

export type EmployeeState = { error: string } | { success: true; employeeId?: number } | null

const CERTIFICATION_STATUSES = ["not_certified", "training", "certified"] as const

export async function createEmployee(
  _previousState: EmployeeState,
  formData: FormData
): Promise<EmployeeState> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const role = String(formData.get("role") ?? "")
  const locationId = Number(formData.get("location_id"))

  if (!name || !email || !password || !locationId || !["manager", "front_desk"].includes(role)) {
    return { error: "Enter a name, work email, password, role, and location." }
  }
  if (!email.includes("@")) return { error: "Enter a valid work email address." }
  if (password.length < 8) return { error: "The initial password must be at least 8 characters." }

  const context = await getAdminContext()
  if (!context) return { error: "Only an active admin can manage employees." }

  const { data: employee, error: employeeError } = await context.admin
    .from("employees")
    .insert({
      name,
      email,
      role,
      location_id: locationId,
      is_active: true,
      certification_status: "not_certified",
    })
    .select("employee_id")
    .single()

  if (employeeError || !employee) {
    return { error: employeeError?.message ?? "Could not create employee record." }
  }

  const { data: authData, error: authError } = await context.admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "employee", employee_id: employee.employee_id },
  })

  if (authError || !authData.user) {
    const { error: rollbackError } = await context.admin
      .from("employees")
      .delete()
      .eq("employee_id", employee.employee_id)
    if (rollbackError) return { error: `${authError?.message ?? "Could not create employee login."} Employee record cleanup failed: ${rollbackError.message}` }
    return { error: authError?.message ?? "Could not create employee login." }
  }

  const { error: linkError } = await context.admin
    .from("employees")
    .update({ auth_user_id: authData.user.id })
    .eq("employee_id", employee.employee_id)

  if (linkError) {
    const { error: authRollbackError } = await context.admin.auth.admin.deleteUser(authData.user.id)
    const { error: rowRollbackError } = await context.admin
      .from("employees")
      .delete()
      .eq("employee_id", employee.employee_id)
    const rollbackErrors = [authRollbackError?.message, rowRollbackError?.message].filter(Boolean)
    return { error: `${linkError.message}${rollbackErrors.length ? ` Cleanup failed: ${rollbackErrors.join("; ")}` : ""}` }
  }

  revalidatePath("/admin/staffing")
  return { success: true, employeeId: employee.employee_id }
}

export async function updateEmployeeCertification(
  _previousState: EmployeeState,
  formData: FormData
): Promise<EmployeeState> {
  const employeeId = Number(formData.get("employee_id"))
  const status = String(formData.get("certification_status") ?? "")
  if (!employeeId || !CERTIFICATION_STATUSES.includes(status as typeof CERTIFICATION_STATUSES[number])) {
    return { error: "Choose a valid employee and certification status." }
  }

  const context = await getAdminContext()
  if (!context) return { error: "Only an active admin can update certifications." }

  const { data: employee, error: lookupError } = await context.admin
    .from("employees")
    .select("role")
    .eq("employee_id", employeeId)
    .maybeSingle()
  if (lookupError) return { error: lookupError.message }
  if (!employee || employee.role === "admin") return { error: "This employee cannot be updated." }

  const { error } = await context.admin
    .from("employees")
    .update({ certification_status: status })
    .eq("employee_id", employeeId)

  if (error) return { error: error.message }
  revalidatePath("/admin/staffing")
  return { success: true }
}

export async function deleteEmployee(
  _previousState: EmployeeState,
  formData: FormData
): Promise<EmployeeState> {
  const employeeId = Number(formData.get("employee_id"))
  if (!employeeId) return { error: "Choose an employee to remove." }

  const context = await getAdminContext()
  if (!context) return { error: "Only an active admin can remove employees." }
  if (employeeId === context.employee.employee_id) return { error: "You cannot remove your own admin account." }

  const { data: employee, error: lookupError } = await context.admin
    .from("employees")
    .select("auth_user_id, role")
    .eq("employee_id", employeeId)
    .maybeSingle()

  if (lookupError) return { error: lookupError.message }
  if (!employee || employee.role === "admin") return { error: "This employee cannot be removed." }

  const { error: deactivateError } = await context.admin
    .from("employees")
    .update({ is_active: false })
    .eq("employee_id", employeeId)

  if (deactivateError) return { error: deactivateError.message }

  if (employee.auth_user_id) {
    const { error: authDeleteError } = await context.admin.auth.admin.deleteUser(employee.auth_user_id)
    if (authDeleteError) {
      return { error: `Employee access was disabled, but the login could not be removed: ${authDeleteError.message}` }
    }
  }

  revalidatePath("/admin/staffing")
  revalidatePath("/admin")
  return { success: true }
}
