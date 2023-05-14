export const formatTypeName = (typeNameBefore: string) => {
  const typeName = typeNameBefore.startsWith('0x') ? typeNameBefore : `0x${typeNameBefore}`;
  return typeName.replace(/^0x0+/, '0x');
};
