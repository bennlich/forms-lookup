// These functions enable/disable the page body from scrolling
// when the mobile search overlay is present

let bodyInitialStyle;

export const freezeBody = () => {
  if (typeof bodyInitialStyle === 'undefined') {
    bodyInitialStyle = document.body.style.overflow;
  }
  document.body.style.overflow = 'hidden';
};

export const unfreezeBody = () => {
  if (typeof bodyInitialStyle === 'undefined') {
    bodyInitialStyle = document.body.style.overflow;
  }
 document.body.style.overflow = bodyInitialStyle; 
};
