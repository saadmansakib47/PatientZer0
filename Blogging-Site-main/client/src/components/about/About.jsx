import { Box, styled, Typography } from '@mui/material';

const Banner = styled(Box)`
    background: linear-gradient(45deg, #0ea5e9 0%, #3b82f6 100%);
    width: 100%;
    height: 50vh;
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 20%;
        left: 10%;
        width: 60%;
        height: 60%;
        background: radial-gradient(circle, rgba(186,230,253,0.5) 0%, rgba(125,211,252,0.3) 50%, rgba(0,0,0,0) 100%);
        filter: blur(80px);
        border-radius: 50%;
        animation: pulse 10s ease-in-out infinite;
        mix-blend-mode: soft-light;
    }

    &::after {
        content: '';
        position: absolute;
        bottom: 10%;
        right: 15%;
        width: 55%;
        height: 55%;
        background: radial-gradient(circle, rgba(191,219,254,0.5) 0%, rgba(147,197,253,0.3) 50%, rgba(0,0,0,0) 100%);
        filter: blur(80px);
        border-radius: 50%;
        animation: pulse 10s ease-in-out infinite 2s;
        mix-blend-mode: soft-light;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 0.9;
            transform: scale(1) translate(0, 0);
        }
        50% {
            opacity: 0.5;
            transform: scale(1.2) translate(-5%, 5%);
        }
    }
`;


const Wrapper = styled(Box)`
    padding: 20px;
    & > h3, & > h5 {
        margin-top: 50px;
    }
`;

const Text = styled(Typography)`
    color: #878787;
`;

const About = () => {
    return (
        <Box>
            <Banner/>
            <Wrapper>
                <Typography variant="h3">PatientZero</Typography>
                <Text variant="h5">
                    Welcome to PatientZero, a collaborative platform designed to empower patients and healthcare professionals. This app allows patients to share health stories, connect with others on their recovery journeys, and access valuable information from medical experts.<br />
                    Dive into our community-driven content and join conversations that bring meaningful support to health experiences.
                </Text>
            </Wrapper>
        </Box>
    )
}

export default About;
