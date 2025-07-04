// Joy
import Alert from '@mui/joy/Alert';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import Grid from '@mui/joy/Grid';
import LinearProgress from '@mui/joy/LinearProgress';
import Skeleton from '@mui/joy/Skeleton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

// Icons
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import WarningIcon from '@mui/icons-material/Warning';

function SearchResults(props: {
	pageData: any | undefined,
}) {
	const {
		pageData = undefined,
	} = props;
	
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
						<Stack divider={<Divider />} spacing={2}>
							<Grid container xs={12} columnSpacing={3}>
								<Grid xs={12}>
									<Typography level="h4">
										Site Search Page
									</Typography>
								</Grid>
								{pageData?.search?.data?.searchpage?.searchURL ? (
									<Grid container xs={12}>
										<Grid xs={5}>
											<Typography>
												Search Page URL
											</Typography>
										</Grid>
										<Grid xs={7}>
											<Skeleton loading={pageData.search?.status === 1} variant="text" level="h1" height={48}>
												<Chip
										      component="a"
										      href={pageData?.search?.data?.searchpage?.searchURL}
										      target="_blank"
										      rel="noopener noreferrer"
										      sx={{
										        whiteSpace: 'normal',
										        wordBreak: 'break-word'
										      }}
										    >
													{pageData?.search?.data?.searchpage?.searchURL}
												</Chip>
											</Skeleton>
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
									{pageData.search?.status === 1 ? (
										<Stack direction="row" alignItems="center" spacing={1}>
											<LinearProgress color="neutral" />
											<Box sx={{width: 30}} />
										</Stack>
									) :
									pageData?.lighthouse?.data?.performance
										?	<Stack direction="row" alignItems="center" spacing={1}>
												<LinearProgress
													determinate
													value={pageData?.lighthouse?.data?.performance * 100}
													color={
														pageData?.lighthouse?.data?.performance > 0.9
														? 'success'
														: pageData?.lighthouse?.data?.performance > 0.7
														? 'neutral' : 'danger'
													}
												/>
												<Typography>
												  {(pageData?.lighthouse?.data?.performance * 100).toFixed(0)}
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
									{pageData.search?.status === 1 ? (
										<Stack direction="row" alignItems="center" spacing={1}>
											<LinearProgress color="neutral" />
											<Box sx={{width: 30}} />
										</Stack>
									) :
									pageData?.lighthouse?.data?.accessibility
										?	<Stack direction="row" alignItems="center" spacing={1}>
												<LinearProgress
													determinate
													value={pageData?.lighthouse?.data?.accessibility * 100}
													color={
														pageData?.lighthouse?.data?.accessibility > 0.9
														? 'success'
														: pageData?.lighthouse?.data?.accessibility > 0.7
														? 'neutral' : 'danger'
													}
												/>
												<Typography>
												  {(pageData?.lighthouse?.data?.accessibility * 100).toFixed(0)}
												</Typography>
											</Stack>
										: <Typography>
												N/A
											</Typography>
									}
								</Grid>
							</Grid>
							<Grid container xs={12} columnSpacing={3} rowSpacing={1}>
								<Grid xs={12}>
									<Typography level="h4">
										Search Page Features
									</Typography>
								</Grid>
								<Grid xs={5}>
									<Typography>
										Auto Suggest
									</Typography>
								</Grid>
								<Grid xs={7}>
									<Skeleton loading={pageData.search?.status === 1} variant="text" level="h1" height={34}>
										{pageData?.search?.data?.searchFeatures
											? pageData?.search?.data?.searchFeatures?.autocomplete ? (
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
									</Skeleton>
								</Grid>
								<Grid xs={5}>
									<Typography>
										Spell Checking
									</Typography>
								</Grid>
								<Grid xs={7}>
									<Skeleton loading={pageData.search?.status === 1} variant="text" level="h1" height={34}>
										{pageData?.search?.data?.searchFeatures
											? pageData?.search?.data?.searchFeatures?.spellchecking ? (
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
									</Skeleton>
								</Grid>
								<Grid xs={5}>
									<Typography>
										Analytics
									</Typography>
								</Grid>
								<Grid xs={7}>
									<Skeleton loading={pageData.search?.status === 1} variant="text" level="h1" height={34}>
										{pageData?.search?.data?.searchFeatures
											? pageData?.search?.data?.analytics ? (
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
									</Skeleton>
								</Grid>
							</Grid>
						</Stack>
					</Grid>
					<Grid xs={6}>
						<AspectRatio sx={{ minWidth: 300 }}>
							<Skeleton loading={pageData.search?.status === 1}>
								{pageData?.search?.data?.screenshots?.search !== '' ? (
									<Box
										component='img'
										src={`data:image/png;base64, ${pageData?.search?.data?.screenshots?.search}`}
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
							</Skeleton>
						</AspectRatio>
					</Grid>
				</Grid>
			)}
		</Box>
  )
}

export default SearchResults
