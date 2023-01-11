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
