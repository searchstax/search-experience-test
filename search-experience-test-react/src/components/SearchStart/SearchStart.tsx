
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
import WarningIcon from '@mui/icons-material/Warning';

function SearchStart(props: {
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
				<Grid container columnSpacing={3}>
					<Grid xs={6}>
						<Stack divider={<Divider />} spacing={2}>
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
									<Chip
							      component="a"
							      href={pageData?.search?.data?.searchpage?.startURL}
							      target="_blank"
							      rel="noopener noreferrer"
							      sx={{
							        whiteSpace: 'normal',
							        wordBreak: 'break-word'
							      }}
							    >
							      {pageData?.search?.data?.searchpage?.startURL}
							    </Chip>
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
								<Grid xs={7}>
									<Skeleton loading={pageData.search?.status === 1} variant="text" level="h1" height={48}>
										{pageData?.search?.data?.searchpage?.sitesearch?.height !== 0 ? (
											<>
												<Typography>
													{pageData?.search?.data?.searchpage?.sitesearch?.height}px x {pageData?.search?.data?.searchpage?.sitesearch?.width}px
												</Typography>
												<Typography>
													Search bar occupies <Typography sx={{fontWeight: 700}}>{(pageData?.search?.data?.searchpage?.sitesearch?.coverage * 100).toFixed(1)}%</Typography> of above the fold area
												</Typography>
											</>
										) : (
											<Alert startDecorator={<WarningIcon />} color="warning">
												Could not find search bar
											</Alert>
										)}
									</Skeleton>
								</Grid>
								<Grid xs={5}>
									<Typography>
										Schema Tagging
									</Typography>
								</Grid>
								{pageData?.schema && Object.keys(pageData?.schema).length !== 0 ? (
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
									{pageData.search?.status === 1 ? (
										<Stack direction="row" alignItems="center" spacing={1}>
											<LinearProgress color="neutral" />
											<Box sx={{width: 30}} />
										</Stack>
									) :
									pageData?.lighthouse?.data?.seo
										?	<Stack direction="row" alignItems="center" spacing={1}>
												<LinearProgress
													determinate
													value={pageData?.lighthouse?.data?.seo * 100}
													color={
														pageData?.lighthouse?.data?.seo > 0.9
														? 'success'
														: pageData?.lighthouse?.data?.seo > 0.7
														? 'neutral' : 'danger'
													}
												/>
												<Typography>
												  {(pageData?.lighthouse?.data?.seo * 100).toFixed(0)}
												</Typography>
											</Stack>
										: 
											<Typography>
												N/A
											</Typography>
									}
								</Grid>
							</Grid>
						</Stack>
					</Grid>
					<Grid xs={6}>
						<AspectRatio sx={{ minWidth: 300 }}>
							<Skeleton loading={pageData.search?.status === 1}>
								<Box
									component='img'
									src={`data:image/png;base64, ${pageData?.search?.data?.screenshots?.original}`}
									sx={{
										border: 'solid',
										borderWidth: 1,
									}}
								/>
							</Skeleton>
						</AspectRatio>
					</Grid>
				</Grid>
			)}
		</Box>
  )
}

export default SearchStart
