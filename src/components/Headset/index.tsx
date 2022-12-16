import React from 'react';
import {
    Main,
    Container,
    Image,
    Details,
    ButtonGroup,
    ButtonSecondary,
    Stock,
    Ball,
    ButtonPrimary,
    Offer,
    PriceOn,
    PriceOff,
    Title,
    Shipping,
    IconCart,
    IconWishlist
} from './styles';

function Headset() {
    return (
        <Main>
            <Container>
                <Image>
                </Image>
                <Details>
                    <Shipping>Free shipping</Shipping>
                    <Title>Razer Kraken Kitty Edt Gaming Headset Quartz</Title>
                    <PriceOff>1.599,00</PriceOff>
                    <PriceOn>799,00</PriceOn>
                    <Offer>The offer is valid until April 3 or as long as stock lasts!</Offer>
                    <ButtonPrimary>Add to cart</ButtonPrimary>
                    <Stock><Ball />50+ pcs. in stock.</Stock>
                    <ButtonGroup>
                        <ButtonSecondary>
                            <IconCart />Add to cart</ButtonSecondary>
                        <ButtonSecondary>
                            <IconWishlist />Add to wishlist</ButtonSecondary>
                    </ButtonGroup>
                </Details>
            </Container>
        </Main>
    );
};

export default Headset;