import React from 'react';
import {
    Main,
    Container,
    Image,
    Details,
    ButtonGroup,
    ButtonStyled,
    Stock,
    Ball,
    ButtonPrimary,
    Offer,
    PriceOn,
    PriceOff,
    Title,
    Shipping,
    IconCart,
    IconWish
} from './styles';

function ButtonSecondary(props: { text: string, icon: any }){
    return (
        <ButtonStyled>
            <span>{props.icon}</span><span>{props.text}</span>
        </ButtonStyled>
    )
}

function Headset() {
    return (
        <Main>
            <Container>
                <Image />
                <Details>
                    <Shipping>Free shipping</Shipping>
                    <Title>Razer Kraken Kitty Edt Gaming Headset Quartz</Title>
                    <PriceOff>1.599,00</PriceOff>
                    <PriceOn>799,00</PriceOn>
                    <Offer>The offer is valid until April 3 or as long as stock lasts!</Offer>
                    <ButtonPrimary>Add to cart</ButtonPrimary>
                    <Stock><Ball />50+ pcs. in stock.</Stock>
                    <ButtonGroup>
                        <ButtonSecondary 
                            text="Add to cart"
                            icon={<IconCart />}
                         />
                        <ButtonSecondary 
                            text="Add to wishlist"
                            icon={<IconWish />} 
                        />                     
                    </ButtonGroup>
                </Details>
            </Container>
        </Main>
    );
};

export default Headset;