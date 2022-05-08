export const stripe = {
  charges:{
    create: jest
      .fn()
      .mockResolvedValue({id: "test_stripe_id"}),
  },
};