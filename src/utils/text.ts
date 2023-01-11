export const getAddressString = (address: Address) => {
  return `${address.address1} ${address.address2 ? `${address.address2}, ` : ""} ${address.city}, ${
    address.state
  }`;
};
