import CardView from "./card.view";

export default function CardController(props: any) {
  return (
    <>
      <CardView
        card={props.card}
        contribute={props.contribute}
        claimRewards={props.claimRewards}
        index={props.index}
      ></CardView>
    </>
  );
}
