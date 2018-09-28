export const SOME_NON_RESPONSIVE_PORTS = 'some-non-responsive-ports';
export const NON_RESPONSIVE_PORTS = 'non-responsive-ports';

const Error = (reason, description) => ({
    reason,
    description,
});

export default Error;
