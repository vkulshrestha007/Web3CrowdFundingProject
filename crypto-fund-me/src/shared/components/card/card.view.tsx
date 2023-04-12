import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Alert, Box, LinearProgress } from "@mui/material";
import TokenIcon from "@mui/icons-material/Token";

export default function CardView(props: any) {
  return (
    <Card
      sx={{ maxWidth: 250, minWidth: 250, minHeight: 360 }}
      className={props.card.ended ? "bg-stone-400" : ""}
    >
      <CardMedia
        sx={{ height: 140 }}
        image={props?.card?.image}
        title="green iguana"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {props?.card?.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          className="overflow-ellipsis overflow-x-hidden whitespace-nowrap"
        >
          {props?.card?.statement}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-5">
          Funding Goal Progress <br />
          <TokenIcon />
          {" (" + props.card.collection + "/" + props.card.target + ")"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          className="mt-5 mb-5"
        >
          End Date: {" " + props.card.expiryDate}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ width: "100%", mr: 1 }}>
            <LinearProgress
              variant="determinate"
              value={props?.card?.progress}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${Math.round(
              props?.card?.progress
            )}%`}</Typography>
          </Box>
        </Box>
      </CardContent>
      {props?.card?.ended ? (
        <>
          <Alert severity="info"> Campaign Ended</Alert>
        </>
      ) : (
        <>
          <CardActions>
            {props.card.showContribute && (
              <Button
                size="small"
                onClick={() => props?.contribute(props?.index)}
              >
                Contribute
              </Button>
            )}
            {props.card.showClaim && (
              <Button
                size="small"
                onClick={() => props?.claimRewards(props?.index)}
              >
                Claim Rewards
              </Button>
            )}
            {props.card.showEndCampaign && (
              <Button
                size="small"
                onClick={() => props?.endCampaign(props?.index)}
              >
                End Campaign
              </Button>
            )}
          </CardActions>
        </>
      )}
    </Card>
  );
}
