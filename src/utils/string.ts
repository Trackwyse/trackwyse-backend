/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

export const getAddressString = (address: Address) => {
  return `${address.address1} ${address.address2 ? `${address.address2}, ` : ""} ${address.city}, ${
    address.state
  }`;
};

export const toTitleCase = (str: string) => {
  if (!str) {
    return undefined;
  }

  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
