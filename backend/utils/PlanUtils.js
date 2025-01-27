const validateUserPlan = (user) => {
    if (user.plan === 'No tienes un plan' || user.planDuration <= 0) {
      return { valid: false, message: 'El usuario no tiene un plan activo o el plan ha expirado' };
    }
    return { valid: true };
  };
  
  module.exports = { validateUserPlan };
  