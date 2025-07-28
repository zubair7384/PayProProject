export const calculateDistribution = (data) => {
  const amount = parseFloat(data.paymentAmount);
  const companyShare = amount * 0.3; // Fixed 30%
  const remainingAmount = amount * 0.7; // 70% to distribute

  let workingDevShare = 0;
  let jobHunterShare = 0;
  let communicatorShare = 0;

  const samePersonForAll = 
    data.workingDev === data.jobHunter && 
    data.workingDev === data.communicatingDev;

  if (samePersonForAll) {
    // Same person did everything - gets full 70%
    workingDevShare = remainingAmount;
  } else {
    // Different people involved
    let devBaseShare = remainingAmount;

    // Job hunter gets 5% if different person
    if (data.jobHunter !== data.workingDev && data.jobHunter.trim() !== '') {
      jobHunterShare = amount * 0.05; // 5% of total
      devBaseShare = amount * 0.65; // 65% of total
    }

    // Communicator gets 10% from dev's share if different person
    if (data.communicatingDev !== data.workingDev && data.communicatingDev.trim() !== '') {
      communicatorShare = devBaseShare * 0.1; // 10% of dev's share
      workingDevShare = devBaseShare - communicatorShare;
    } else {
      workingDevShare = devBaseShare;
    }
  }

  return {
    company: companyShare,
    workingDev: workingDevShare,
    jobHunter: jobHunterShare,
    communicator: communicatorShare,
  };
};