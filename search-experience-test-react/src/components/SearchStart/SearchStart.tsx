
// Joy
import Alert from '@mui/joy/Alert';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Grid from '@mui/joy/Grid';
import LinearProgress from '@mui/joy/LinearProgress';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

// Icons
import WarningIcon from '@mui/icons-material/Warning';

function SearchStart(props: {
	pageData: any | undefined
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
				<Grid container columnSpacing={3}>
					<Grid container xs={6}>
						<Grid container xs={12} columnSpacing={2}>
							<Grid xs={12}>
								<Typography level="h4">
									Starting Page
								</Typography>
							</Grid>
							<Grid xs={5}>
								<Typography>
									URL
								</Typography>
							</Grid>
							<Grid xs={7}>
								<Typography>
									{pageData?.searchpage?.startURL}
								</Typography>
							</Grid>
						</Grid>
						<Grid container xs={12} columnSpacing={2} rowSpacing={1}>
							<Grid xs={12}>
								<Typography level="h4">
									Site Search
								</Typography>
							</Grid>
							<Grid xs={5}>
								<Typography>
									Search Bar
								</Typography>
							</Grid>
							{pageData?.searchpage?.sitesearch?.height !== 0 ? (
								<Grid xs={7}>
									<Typography>
										{pageData?.searchpage?.sitesearch?.height}px x {pageData?.searchpage?.sitesearch?.width}px
									</Typography>
									<Typography>
										Search bar occupies <Typography sx={{fontWeight: 700}}>{(pageData?.searchpage?.sitesearch?.coverage * 100).toFixed(1)}%</Typography> of above the fold area
									</Typography>
								</Grid>
							) : (
								<Grid xs={7}>
									<Alert startDecorator={<WarningIcon />} color="warning">
										Could not find search bar
									</Alert>
								</Grid>
							)}
							<Grid xs={5}>
								<Typography>
									Schema Tagging
								</Typography>
							</Grid>
							{Object.keys(pageData?.schema).length !== 0 ? (
								<Grid xs={7}>
									<Typography>
										{pageData?.searchpage?.sitesearch?.height}px x {pageData?.searchpage?.sitesearch?.width}px
									</Typography>
									<Typography>
										Search bar occupies <Typography sx={{fontWeight: 700}}>{(pageData?.searchpage?.sitesearch?.coverage * 100).toFixed(1)}%</Typography> of above the fold area
									</Typography>
								</Grid>
							) : (
								<Grid xs={7}>
									<Alert startDecorator={<WarningIcon />} color="warning">
										Could not find search schema
									</Alert>
								</Grid>
							)}
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
						<Grid container xs={12} columnSpacing={2}>
							<Grid xs={12}>
								<Typography level="h4">
									Page Speed
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
									: 
										<Typography>
											N/A
										</Typography>
								}
							</Grid>
						</Grid>
						<Grid container xs={12} columnSpacing={2}>
							<Grid xs={12}>
								<Typography level="h4">
									SEO
								</Typography>
							</Grid>
							<Grid xs={5}>
								<Typography>
									Google Search Engine Best Practices
								</Typography>
							</Grid>
							<Grid xs={7}>
								{pageData?.pagespeed?.score?.seo
									?	<Stack direction="row" alignItems="center" spacing={1}>
											<LinearProgress
												determinate
												value={pageData?.pagespeed?.score?.seo * 100}
												color={
													pageData?.pagespeed?.score?.seo > 0.9
													? 'success'
													: pageData?.pagespeed?.score?.seo > 0.7
													? 'warning' : 'danger'
												}
											/>
											<Typography>
											  {(pageData?.pagespeed?.score?.seo * 100).toFixed(0)}
											</Typography>
										</Stack>
									: 
										<Typography>
											N/A
										</Typography>
								}
							</Grid>
						</Grid>
					</Grid>
					<Grid xs={6}>
						<AspectRatio sx={{ minWidth: 300 }}>
							<Box
								component='img'
								src={`data:image/png;base64, ${pageData?.screenshots.original}`}
								sx={{
									border: 'solid',
									borderWidth: 1,
								}}
							/>
						</AspectRatio>
					</Grid>
				</Grid>
			)}
		</Box>
  )
}

export default SearchStart
