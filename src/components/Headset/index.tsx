import React from 'react';
import {
    Main,
    Container,
    Image,
    Details,
    ButtonCart,
    ButtonWishlist,
    Stock,
    Ball,
    ButtonAdd,
    Offer,
    PriceOn,
    PriceOff,
    Title,
    Shipping
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
                    <PriceOff>price off</PriceOff>
                    <PriceOn>799,00</PriceOn>
                    <Offer>The offer is valid until April 3 or as long as stock lasts!</Offer>
                    <ButtonAdd>Add to cart</ButtonAdd>
                    <Stock><Ball />50+ pcs. in stock.</Stock>
                    <ButtonCart>Add to cart</ButtonCart><ButtonWishlist>Add to wishlist</ButtonWishlist>
                </Details>

            </Container>
        </Main>
    );
};

export default Headset;