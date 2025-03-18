import { Box, styled, Typography, Link } from '@mui/material';
import { Phone, Email, LocationOn } from '@mui/icons-material';

const Banner = styled(Box)`
    background-image: url(https://imgs.search.brave.com/knjEv6JfmzBezF7kUB5xmyhsiqcSbQjt3yW_IcCFC-E/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS12ZWN0b3Iv/Y2FydG9vbi1wcm9m/ZXNzaW9uYWwtaG9z/cGl0YWwtdGVhbS1k/b2N0b3JzLWZsYXQt/aWxsdXN0cmF0aW9u/Xzc0ODU1LTE4NzI1/LmpwZz9zZW10PWFp/c19oeWJyaWQ);
    width: 100%;
    height: 50vh;
    background-position: center;
    background-size: cover;
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

const Contact = () => {
    return (
        <Box>
            <Banner />
            <Wrapper>
                <Typography variant="h3">Get in Touch with Us!</Typography>    
                <Text variant="h5">
                    We're here to help! Reach out to us through any of the following channels:
                </Text>
                <Text variant="h5">
                    <Phone style={{ marginRight: 5 }} /> (123) 456-7890
                </Text>
                <Text variant="h5">
                    <Email style={{ marginRight: 5 }} /> contact@patientzero.com
                </Text>
                <Text variant="h5">
                    <LocationOn style={{ marginRight: 5 }} /> 123 Health St, Wellness City, HC 12345
                </Text>
            </Wrapper>
        </Box>
    );
}

export default Contact;
