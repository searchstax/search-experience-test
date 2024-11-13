import { useState } from 'react'

// Joy
import Alert from '@mui/joy/Alert';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Grid from '@mui/joy/Grid';
import LinearProgress from '@mui/joy/LinearProgress';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

// Icons
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import WarningIcon from '@mui/icons-material/Warning';

function SearchResults(props: {
	pageData: any | undefined,
	searchFeatures: any | undefined,
	checkSearchFeaturesCallback: () => Promise<any> | undefined,
}) {
	const {
		pageData = undefined,
		searchFeatures = undefined,
		checkSearchFeaturesCallback = undefined,
	} = props;
  const [loading, setLoading] = useState<boolean>(false);
	
	const checkSearchFeatures = async () => {
		if (checkSearchFeaturesCallback) {
			setLoading(true);
			await checkSearchFeaturesCallback()?.then(async () => {
				setLoading(false);
	    }).catch((error: Error) => {
				console.log('Could not get relevance data', error);
			});
		}
  }

  return (
    <Box
      sx={{
        margin: 'auto',
        maxWidth: '1178px',
      }}
    >
    	{pageData !== undefined && (
				<Grid container columnSpacing={3} rowSpacing={1}>
					<Grid container xs={6}>
						<Grid container xs={12} columnSpacing={3}>
							<Grid xs={12}>
								<Typography level="h4">
									Site Search Page
								</Typography>
							</Grid>
							{pageData?.searchpage?.searchURL ? (
								<Grid container xs={12}>
									<Grid xs={5}>
										<Typography>
											Search Page URL
										</Typography>
									</Grid>
									<Grid xs={7}>
										<Typography>
											{pageData?.searchpage?.searchURL}
										</Typography>
									</Grid>
								</Grid>
							) : (
								<Grid container xs={12}>
									<Grid xs={5}>
										<Typography>
											Search Page URL
										</Typography>
									</Grid>
									<Grid xs={7}>
										<Alert startDecorator={<WarningIcon />} color="warning">
											Could not detect search page URL
										</Alert>
									</Grid>
								</Grid>
							)}
						</Grid>
						<Grid container xs={12} columnSpacing={3}>
							<Grid xs={12}>
								<Typography level="h4">
									Site Search Page Speed
								</Typography>
							</Grid>
							<Grid xs={5}>
								<Typography>
									Performance
								</Typography>
							</Grid>
							<Grid xs={7}>
								{pageData?.pagespeed?.score?.performance
									?	<Stack direction="row" alignItems="center" spacing={1}>
											<LinearProgress
												determinate
												value={pageData?.pagespeed?.score?.performance * 100}
												color={
													pageData?.pagespeed?.score?.performance > 0.9
													? 'success'
													: pageData?.pagespeed?.score?.performance > 0.7
													? 'warning' : 'danger'
												}
											/>
											<Typography>
											  {(pageData?.pagespeed?.score?.performance * 100).toFixed(0)}
											</Typography>
										</Stack>
									: <Typography>
											N/A
										</Typography>
								}
							</Grid>
						</Grid>
						<Grid container xs={12} columnSpacing={3}>
							<Grid xs={12}>
								<Typography level="h4">
									WCAG Best Practices
								</Typography>
							</Grid>
							<Grid xs={5}>
								<Typography>
									Accessibility Score
								</Typography>
							</Grid>
							<Grid xs={7}>
								{pageData?.pagespeed?.score?.accessibility
									?	<Stack direction="row" alignItems="center" spacing={1}>
											<LinearProgress
												determinate
												value={pageData?.pagespeed?.score?.accessibility * 100}
												color={
													pageData?.pagespeed?.score?.accessibility > 0.9
													? 'success'
													: pageData?.pagespeed?.score?.accessibility > 0.7
													? 'warning' : 'danger'
												}
											/>
											<Typography>
											  {(pageData?.pagespeed?.score?.accessibility * 100).toFixed(0)}
											</Typography>
										</Stack>
									: <Typography>
											N/A
										</Typography>
								}
							</Grid>
						</Grid>
						<Grid container xs={12} columnSpacing={3}>
							<Grid xs={12}>
								<Typography level="h4">
									Search Page Features
								</Typography>
								{searchFeatures === undefined && (
									<Button
										onClick={checkSearchFeatures}
										disabled={loading || pageData?.searchpage?.searchURL === ''}
										loading={loading}
									>
										Check Now
									</Button>
								)}
							</Grid>
							<Grid xs={5}>
								<Typography>
									Auto Suggest
								</Typography>
							</Grid>
							<Grid xs={7}>
								{searchFeatures
									? searchFeatures.autocomplete ? (
										<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
											Autosuggest found!
										</Alert>
									) : (
										<Alert endDecorator={<HelpRoundedIcon />}>
											Not detected
										</Alert>
									)
								: (
									<Typography>
										Not tested
									</Typography>
								)}
							</Grid>
							<Grid xs={5}>
								<Typography>
									Spell Checking
								</Typography>
							</Grid>
							<Grid xs={7}>
								{searchFeatures
									? searchFeatures.spellchecking ? (
										<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
											Spell checking found!
										</Alert>
									) : (
										<Alert endDecorator={<HelpRoundedIcon />}>
											Not detected
										</Alert>
									)
								: (
									<Typography>
										Not tested
									</Typography>
								)}
							</Grid>
							<Grid xs={5}>
								<Typography>
									Analytics
								</Typography>
							</Grid>
							<Grid xs={7}>
								{searchFeatures
									? searchFeatures.analytics ? (
										<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
											Google Analytics found!
										</Alert>
									) : (
										<Alert endDecorator={<HelpRoundedIcon />}>
											Not detected
										</Alert>
									)
								: (
									<Typography>
										Not tested
									</Typography>
								)}
							</Grid>
						</Grid>
					</Grid>
					<Grid xs={6}>
						<AspectRatio sx={{ minWidth: 300 }}>
							{pageData?.screenshots?.search !== '' ? (
								<Box
									component='img'
									src={`data:image/png;base64, ${pageData?.screenshots?.search}`}
									sx={{
										border: 'solid',
										borderWidth: 1,
									}}
								/>
							) : (
								<Typography component="div">
							    No Search Page Found
							  </Typography>
							)}
						</AspectRatio>
					</Grid>
				</Grid>
			)}
		</Box>
  )
}

export default SearchResults
