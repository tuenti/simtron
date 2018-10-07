export const NON_RESPONSIVE_PORTS = 'non-responsive-ports';
export const INVALID_ICC = 'invalid-icc';

const Error = (reason, description) => ({
    reason,
    description,
});

export default Error;
