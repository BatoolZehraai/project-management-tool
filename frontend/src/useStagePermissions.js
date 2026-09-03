import { useMemo } from 'react';

/**
 * useStagePermissions Hook
 * 
 * Evaluates department-based stage ownership and role-based permissions:
 * - SUPER_ADMIN / Admin: Universal write/edit access across all stages.
 * - DEPT_HEAD / TEAM_MEMBER: Full write/edit access in their stage's governing department.
 * - External Department Users: Strict read-only mode (view all stages, but cards/modals locked).
 * 
 * @param {Object} currentUser Authenticated user object with { role, department }
 * @param {Object|string} activeStage Active stage/phase object or 'ALL'
 * @returns {Object} { isReadOnly, canCreateTask, canEditTask, canDeleteTask, isSuperAdmin, governingDept, readOnlyReason }
 */
export function useStagePermissions(currentUser, activeStage) {
  return useMemo(() => {
    if (!currentUser) {
      return {
        isReadOnly: true,
        canCreateTask: false,
        canEditTask: false,
        canDeleteTask: false,
        isSuperAdmin: false,
        governingDept: null,
        readOnlyReason: 'Not authenticated'
      };
    }

    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'Admin';
    
    // When activeStage is 'ALL' (Cross-Pipeline View)
    if (!activeStage || activeStage === 'ALL') {
      return {
        isReadOnly: false,
        isCrossStage: true,
        canCreateTask: isSuperAdmin,
        canEditTask: true,
        canDeleteTask: isSuperAdmin,
        isSuperAdmin,
        governingDept: null,
        readOnlyReason: null
      };
    }

    const governingDept = activeStage.governing_department || activeStage.role_access || null;
    
    if (isSuperAdmin) {
      return {
        isReadOnly: false,
        isCrossStage: false,
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: true,
        isSuperAdmin: true,
        governingDept,
        readOnlyReason: null
      };
    }

    const userDept = (currentUser.department || '').trim().toLowerCase();
    const stageDept = (governingDept || '').trim().toLowerCase();
    const isDeptMember = Boolean(userDept && stageDept && userDept === stageDept);

    const isReadOnly = !isDeptMember;
    const readOnlyReason = isReadOnly 
      ? `Read-only: Governed by ${governingDept || 'stage department'}`
      : null;

    return {
      isReadOnly,
      isCrossStage: false,
      canCreateTask: isDeptMember,
      canEditTask: isDeptMember,
      canDeleteTask: isDeptMember,
      isSuperAdmin: false,
      governingDept,
      readOnlyReason
    };
  }, [currentUser, activeStage]);
}

export default useStagePermissions;
