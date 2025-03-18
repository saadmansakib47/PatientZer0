import { styled, Box, Typography } from '@mui/material';

const Image = styled(Box)`
    width: 100%;
    height: 50vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative; /* To position the pseudo-element */
    overflow: hidden; /* Prevent overflow of the blurred background */
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: url('https://images.pexels.com/photos/4054215/pexels-photo-4054215.jpeg') center/cover no-repeat;
        filter: blur(8px); /* Adjust the blur amount here */
        z-index: 1; /* Ensure this is behind the text */
    }
`;

const Heading = styled(Typography)`
    font-size: 60px;
    color: #FFFFFF;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6); /* Adding text shadow for better readability */
    margin-bottom: 10px;
    line-height: 1.2;
    position: relative; /* To place above the blurred image */
    z-index: 2; /* Ensure this is above the background */
`;

const SubHeading = styled(Typography)`
    font-size: 25px;
    color: #FFFFFF;
    font-weight: 300;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6); /* Text shadow to enhance readability */
    position: relative; /* To place above the blurred image */
    z-index: 2; /* Ensure this is above the background */
`;

const Banner = () => {
    return (
        <Image>
            <Heading>Welcome to PatientZero</Heading>
            <SubHeading>Your Health Journey Starts Here</SubHeading>
        </Image>
    )
}

export default Banner;
