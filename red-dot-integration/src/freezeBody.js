let bodyInitialStyle;

export const freezeBody = () => {
  if (typeof bodyInitialStyle === 'undefined') {
    bodyInitialStyle = document.body.style.overflow;
    console.log("SETTING INITIAL STYLE", bodyInitialStyle)
  }
  document.body.style.overflow = 'hidden';
};

export const unfreezeBody = () => {
  if (typeof bodyInitialStyle === 'undefined') {
    bodyInitialStyle = document.body.style.overflow;
    console.log("SETTING INITIAL STYLE", bodyInitialStyle)
  }
 document.body.style.overflow = bodyInitialStyle; 
};
