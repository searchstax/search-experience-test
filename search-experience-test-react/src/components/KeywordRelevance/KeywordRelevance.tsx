// Joy
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Grid from '@mui/joy/Grid';
import LinearProgress from '@mui/joy/LinearProgress';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

function KeywordRelevance(props: {
	pageData: any | undefined,
	relevanceData: any | undefined,
}) {
	const {
		pageData = undefined,
		relevanceData = undefined,
	} = props;

  return (
    <Grid container xs={12} sx={{mb: 3}}>
    	{pageData !== undefined && (
				<Grid container columnSpacing={3} xs={12}>
					<Grid container xs={6}>
						{pageData?.search?.data?.searchpage?.searchURL && (
							<Grid xs={12}>
								<Grid xs={12}>
									<Typography level="title-md">
										Search results for "{relevanceData.query}"
									</Typography>
								</Grid>
								<Grid container xs={12}>
									<Stack>
										<Stack direction="row" alignItems="center" spacing={2} sx={{pl: 2}}>
											<Typography level="body-sm">
												Relevance
											</Typography>
											<Box sx={{width: 100}}>
												<LinearProgress determinate value={relevanceData?.quality?.relevancy_score * 10} />
											</Box>
										</Stack>
										<Typography level="body-sm" sx={{pl: 2}}>
											{relevanceData.quality?.relevance_summary}
										</Typography>
										<Stack spacing={0.5}>
											<Typography level="title-sm">
												Opportunities
											</Typography>
											{relevanceData.quality?.page_recommendations.length && relevanceData.quality?.page_recommendations?.map((recommendation: any, index: number) => (
												<Typography key={index} level="body-sm" sx={{pl: 2}}>
													- {recommendation}
												</Typography>
											))}
										</Stack>
									</Stack>
								</Grid>
							</Grid>
						)}
					</Grid>
					<Grid xs={6}>
						<Box
							sx={{
								position: 'relative',
								minHeight: 300, 
								border: 'solid',
								borderWidth: 1,
							}}
						>
							<AspectRatio>
								{pageData?.screenshots?.search !== '' ? (
									<Box
										component='img'
										src={`data:image/png;base64, ${pageData?.search?.data?.screenshots?.search}`}
									/>
								) : (
									<Typography component="div">
								    No Search Page Found
								  </Typography>
								)}
							</AspectRatio>
							{relevanceData?.data?.screenshots?.search && (
								<AspectRatio sx={{ 
									position: 'absolute',
									top: 0,
									left: 0,
									height: '100%',
									width: '100%', }}>
									<Box
										component='img'
										src={`data:image/png;base64, ${relevanceData?.data?.screenshots?.search}`}
										sx={{
										  "@keyframes fadein": {
										    from: {
										      opacity: 0,
										    },
										    to: {
										      opacity: 1,
										    }
										  },
										  animation: "fadein 1s ease",
										}}
									/>
								</AspectRatio>
							)}
						</Box>
					</Grid>
				</Grid>
			)}
		</Grid>
  )
}

export default KeywordRelevance
