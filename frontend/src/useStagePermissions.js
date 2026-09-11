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
 * @returns {Object} { isReadOnly, canCreateTask, canCreate, canEditTask, canEdit, canDeleteTask, canDelete, isSuperAdmin, governingDept, readOnlyReason }
 */
export function useStagePermissions(currentUser, activeStage) {
  return useMemo(() => {
    if (!currentUser) {
      return {
        isReadOnly: true,
        canCreateTask: false,
        canCreate: false,
        canEditTask: false,
        canEdit: false,
        canDeleteTask: false,
        canDelete: false,
        isSuperAdmin: false,
        governingDept: null,
        readOnlyReason: 'Not authenticated'
      };
    }

    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'Admin' || currentUser.role === 'ADMIN';
    
    // Super Admins ALWAYS have full universal access across all stages and views
    if (isSuperAdmin) {
      const governingDept = (activeStage && typeof activeStage === 'object')
        ? (activeStage.governing_department || activeStage.role_access || null)
        : null;

      return {
        isReadOnly: false,
        isCrossStage: activeStage === 'ALL' || !activeStage,
        canCreateTask: true,
        canCreate: true,
        canEditTask: true,
        canEdit: true,
        canDeleteTask: true,
        canDelete: true,
        isSuperAdmin: true,
        governingDept,
        readOnlyReason: null
      };
    }

    // When activeStage is 'ALL' (Cross-Pipeline View for Non-Admin)
    if (!activeStage || activeStage === 'ALL') {
      return {
        isReadOnly: false,
        isCrossStage: true,
        canCreateTask: false,
        canCreate: false,
        canEditTask: true,
        canEdit: true,
        canDeleteTask: false,
        canDelete: false,
        isSuperAdmin: false,
        governingDept: null,
        readOnlyReason: null
      };
    }

    const governingDept = activeStage.governing_department || activeStage.role_access || null;
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
      canCreate: isDeptMember,
      canEditTask: isDeptMember,
      canEdit: isDeptMember,
      canDeleteTask: isDeptMember,
      canDelete: isDeptMember,
      isSuperAdmin: false,
      governingDept,
      readOnlyReason
    };
  }, [currentUser, activeStage]);
}

export default useStagePermissions;
